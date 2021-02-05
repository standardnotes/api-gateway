import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete } from 'inversify-express-utils'
import { SuperAgentStatic } from 'superagent'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'

@controller('/v1')
export class V1APIController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPClient) private httpClient: SuperAgentStatic,
    @inject(TYPES.HTTP_CALL_TIMEOUT) private httpCallTimeout: number,
    @inject(TYPES.AUTH_SERVER_URL) private authServerUrl: string,
    @inject(TYPES.Logger) private logger: Logger
  ) {
    super()
  }

  @httpDelete('/sessions/:uuid', TYPES.AuthMiddleware)
  async deleteSession(request: Request, response: Response): Promise<void> {
    try {
      const serviceResponse = await this.httpClient(request.method, `${this.authServerUrl}/session/`)
        .timeout(this.httpCallTimeout)
        .set(request.headers)
        .send({
          uuid: request.params.uuid
        })

      response.setHeader('content-type', serviceResponse.header['content-type'])
      response.status(serviceResponse.status).send(serviceResponse.text)
    } catch (error) {
      this.logger.error('Could not pass the request to underlying services')

      this.logger.debug('Response error: %O', error.response)

      response.setHeader('content-type', error.response.header['content-type'])
      response.status(error.status).send(error.response.text)
    }
  }
}
