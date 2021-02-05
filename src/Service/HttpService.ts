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
    @inject(TYPES.Logger) private logger: Logger
  ) {
  }

  async callAuthServer(request: Request, response: Response, endpoint: string, payload?: Record<string, unknown>): Promise<void> {
    try {
      const serviceResponse = await this.httpClient(request.method, `${this.authServerUrl}/${endpoint}`)
        .timeout(this.httpCallTimeout)
        .set(request.headers)
        .send(payload)

      response.setHeader('content-type', serviceResponse.headers['content-type'])
      response.status(serviceResponse.status).send(serviceResponse.text)
    } catch (error) {
      this.logger.error('Could not pass the request to underlying services')

      this.logger.debug('Response error: %O', error.response)

      if (error.response.headers && error.response.headers['content-type']) {
        response.setHeader('content-type', error.response.headers['content-type'])
      }
      response.status(error.status).send(error.response.body)
    }
  }
}
