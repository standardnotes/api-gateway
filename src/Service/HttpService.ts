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
    @inject(TYPES.HTTP_CALL_TIMEOUT) private httpCallTimeout: number,
    @inject(TYPES.AUTH_SERVER_URL) private authServerUrl: string,
    @inject(TYPES.SYNCING_SERVER_JS_URL) private syncingServerJsUrl: string,
    @inject(TYPES.SYNCING_SERVER_RUBY_URL) private syncingServerRubyUrl: string,
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async callSyncingServer(request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    await this.callServer(this.syncingServerJsUrl, request, response, endpoint, payload)
  }

  async callLegacySyncingServer(request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    await this.callServerWithLegacyFormat(this.syncingServerRubyUrl, request, response, endpoint, payload)
  }

  async callAuthServer(request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    await this.callServer(this.authServerUrl, request, response, endpoint, payload)
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
        .timeout(this.httpCallTimeout)
        .set(headers)
        .set('Accept', 'application/json')
        .query(request.query)

      if (response.locals.authToken) {
        void serviceRequest.set('X-Auth-Token', response.locals.authToken)
      }

      return serviceRequest.send(payload)
    } catch (error) {
      this.logger.error('Could not pass the request to underlying services')

      this.logger.debug('Response error: %O', error.response ?? error)

      if (error.response.header && error.response.header['content-type']) {
        response.setHeader('content-type', error.response.header['content-type'])
      }
      response.status(error.status).send(error.response.body)
    }

    return
  }

  private async callServer(serverUrl: string, request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    const serviceResponse = await this.getServerResponse(serverUrl, request, response, endpoint, payload)

    this.logger.debug('Response from underlying server: %O', serviceResponse)

    if (!serviceResponse) {
      return
    }

    response.setHeader('content-type', serviceResponse.header['content-type'])
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

    this.logger.debug('Response from underlying legacy server: %O', serviceResponse)

    if (!serviceResponse) {
      return
    }

    response.setHeader('content-type', serviceResponse.header['content-type'])
    response.status(serviceResponse.status).send(serviceResponse.body)
  }
}
