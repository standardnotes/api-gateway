import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { SuperAgentStatic, Response as SuperAgentResponse } from 'superagent'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'
import { HttpServiceInterface } from './HttpClientInterface'

@injectable()
export class HttpService implements HttpServiceInterface {
  constructor(
    @inject(TYPES.HTTPClient) private httpClient: SuperAgentStatic,
    @inject(TYPES.AUTH_SERVER_URL) private authServerUrl: string,
    @inject(TYPES.SYNCING_SERVER_JS_URL) private syncingServerJsUrl: string,
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

  async callAuthServerWithLegacyFormat(request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    await this.callServerWithLegacyFormat(this.authServerUrl, request, response, endpoint, payload)
  }

  private async getServerResponse(serverUrl: string, request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<SuperAgentResponse | undefined> {
    try {
      this.logger.debug(`Calling [${request.method}] ${serverUrl}/${endpoint},
        headers: ${JSON.stringify(request.headers)},
        query: ${JSON.stringify(request.query)},
        payload: ${JSON.stringify(payload)}`)

      const headers = request.headers
      delete headers.host

      const serviceRequest = this.httpClient(request.method, `${serverUrl}/${endpoint}`)
        .set(headers)
        .set('Accept', 'application/json')
        .query(request.query)
        .ok(res => res.status < 500)

      if (response.locals.authToken) {
        void serviceRequest.set('X-Auth-Token', response.locals.authToken)
      }

      let serviceResponse: SuperAgentResponse
      if (
        payload === null ||
        payload === undefined ||
        (typeof payload === 'object' && Object.keys(payload).length === 0)
      ) {
        serviceResponse = await serviceRequest.send()
      }

      serviceResponse = await serviceRequest.send(payload)

      return serviceResponse
    } catch (error) {
      this.logger.error(`Could not pass the request to underlying services: ${error.response ? error.response.body : error.message}`)

      this.logger.debug('Response error: %O', error.response ?? error)

      if (error.response?.header?.['content-type']) {
        response.setHeader('content-type', error.response.header['content-type'])
      }
      response.status(error.status).send(error.response ? error.response.body : error.message)
    }

    return
  }

  private async callServer(serverUrl: string, request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    const serviceResponse = await this.getServerResponse(serverUrl, request, response, endpoint, payload)

    this.logger.debug('Response from underlying server: %O', serviceResponse?.body)

    if (!serviceResponse) {
      return
    }

    if (serviceResponse?.header?.['content-type']) {
      response.setHeader('content-type', serviceResponse.header['content-type'])
    }

    response.status(serviceResponse.status).send({
      meta: {
        auth: {
          roles: response.locals.roles,
          permissions: response.locals.permissions,
        }
      },
      data: serviceResponse.body
    })
  }

  private async callServerWithLegacyFormat(serverUrl: string, request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    const serviceResponse = await this.getServerResponse(serverUrl, request, response, endpoint, payload)

    this.logger.debug('Response body from underlying legacy server: %O', serviceResponse?.body)

    if (!serviceResponse) {
      return
    }

    if (serviceResponse?.header?.['content-type']) {
      response.setHeader('content-type', serviceResponse.header['content-type'])
    }
    response.status(serviceResponse.status).send(serviceResponse.body)
  }
}
