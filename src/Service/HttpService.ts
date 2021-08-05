import * as qs from 'qs'
import { AxiosInstance, AxiosResponse, Method } from 'axios'
import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { Logger } from 'winston'

import TYPES from '../Bootstrap/Types'
import { HttpServiceInterface } from './HttpClientInterface'

@injectable()
export class HttpService implements HttpServiceInterface {
  constructor(
    @inject(TYPES.HTTPClient) private httpClient: AxiosInstance,
    @inject(TYPES.AUTH_SERVER_URL) private authServerUrl: string,
    @inject(TYPES.SYNCING_SERVER_JS_URL) private syncingServerJsUrl: string,
    @inject(TYPES.PAYMENTS_SERVER_URL) private paymentsServerUrl: string,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async callSyncingServer(request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    await this.callServer(this.syncingServerJsUrl, request, response, endpoint, payload)
  }

  async callLegacySyncingServer(request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    await this.callServerWithLegacyFormat(this.syncingServerJsUrl, request, response, endpoint, payload)
  }

  async callAuthServer(request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    await this.callServer(this.authServerUrl, request, response, endpoint, payload)
  }

  async callPaymentsServer(request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    if (!this.paymentsServerUrl === undefined) {
      this.logger.debug('Payments Server URL not defined. Skipped request to Payments API.')

      return
    }
    await this.callServerWithLegacyFormat(this.paymentsServerUrl, request, response, endpoint, payload)
  }

  async callAuthServerWithLegacyFormat(request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    await this.callServerWithLegacyFormat(this.authServerUrl, request, response, endpoint, payload)
  }

  private async getServerResponse(serverUrl: string, request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<AxiosResponse | undefined> {
    try {
      this.logger.debug(`Calling [${request.method}] ${serverUrl}/${endpoint},
        headers: ${JSON.stringify(request.headers)},
        query: ${JSON.stringify(request.query)},
        payload: ${JSON.stringify(payload)}`)

      const headers = request.headers
      delete headers.host
      delete headers['content-length']

      if (response.locals.authToken) {
        headers['X-Auth-Token'] = response.locals.authToken
      }

      const serviceResponse = await this.httpClient.request({
        method: request.method as Method,
        headers,
        url: `${serverUrl}/${endpoint}`,
        data: this.getRequestData(request, payload),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        params: request.query,
        validateStatus: (status: number) => {
          return status >= 200 && status < 500
        },
      })

      return serviceResponse
    } catch (error) {
      this.logger.error(`Could not pass the request to ${serverUrl}/${endpoint} on underlying service: ${error.response ? JSON.stringify(error.response.body) : error.message}`)

      this.logger.debug('Response error: %O', error.response ?? error)

      if (error.response?.header?.['content-type']) {
        response.setHeader('content-type', error.response.header['content-type'])
      }
      response.status(error.status || 500).send(error.response ? error.response.body : error.message)
    }

    return
  }

  private async callServer(serverUrl: string, request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    const serviceResponse = await this.getServerResponse(serverUrl, request, response, endpoint, payload)

    this.logger.debug('Response from underlying server: %O', serviceResponse?.data)
    this.logger.debug('Response headers from underlying legacy server: %O', serviceResponse?.headers)

    if (!serviceResponse) {
      return
    }

    this.applyResponseHeaders(serviceResponse, response)

    response.status(serviceResponse.status).send({
      meta: {
        auth: {
          roles: response.locals.roles,
          permissions: response.locals.permissions,
        }
      },
      data: serviceResponse.data
    })
  }

  private async callServerWithLegacyFormat(serverUrl: string, request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    const serviceResponse = await this.getServerResponse(serverUrl, request, response, endpoint, payload)

    this.logger.debug('Response body from underlying legacy server: %O', serviceResponse?.data)
    this.logger.debug('Response headers from underlying legacy server: %O', serviceResponse?.headers)

    if (!serviceResponse) {
      return
    }

    this.applyResponseHeaders(serviceResponse, response)

    response.status(serviceResponse.status).send(serviceResponse.data)
  }

  private getRequestData(request: Request, payload: Record<string, unknown> | undefined): Record<string, unknown> | string | undefined {
    if (
      payload === null ||
      payload === undefined ||
      (typeof payload === 'object' && Object.keys(payload).length === 0)
    ) {
      return undefined
    }

    if (request.headers['content-type'] === 'application/x-www-form-urlencoded') {
      return qs.stringify(payload)
    }

    return payload
  }

  private applyResponseHeaders(serviceResponse: AxiosResponse, response: Response): void {
    const returnedHeadersFromUnderlyingService = [
      'access-control-allow-methods',
      'access-control-allow-origin',
      'access-control-expose-headers',
      'authorization',
      'content-type',
      'x-ssjs-version',
      'x-auth-version',
    ]

    returnedHeadersFromUnderlyingService.map((headerName) => {
      const headerValue = serviceResponse.headers[headerName]
      if (headerValue) {
        response.setHeader(headerName, headerValue)
      }
    })
  }
}
