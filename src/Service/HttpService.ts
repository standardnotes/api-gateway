import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { SuperAgentStatic } from 'superagent'
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
    await this.callServer(this.syncingServerRubyUrl, request, response, endpoint, payload)
  }

  async callAuthServer(request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    await this.callServer(this.authServerUrl, request, response, endpoint, payload)
  }

  private async callServer(serverUrl: string, request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    try {
      this.logger.debug(`X-Forwarded-For: ${request.header('X-Forwarded-For')}`)

      const serviceRequest = this.httpClient(request.method, `${serverUrl}/${endpoint}`)
        .timeout(this.httpCallTimeout)
        .set(request.headers)
        .set('Accept', 'application/json')
        .query(request.query)

      if (response.locals.authToken) {
        void serviceRequest.set('X-Auth-Token', response.locals.authToken)
      }

      const serviceResponse = await serviceRequest.send(payload)

      this.logger.debug('Response from underlying server: %O', serviceResponse)

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
    } catch (error) {
      this.logger.error('Could not pass the request to underlying services')

      this.logger.debug('Response error: %O', error.response ?? error)

      if (error.response.header && error.response.header['content-type']) {
        response.setHeader('content-type', error.response.header['content-type'])
      }
      response.status(error.status).send(error.response.body)
    }
  }
}
