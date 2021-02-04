import { Request } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, results } from 'inversify-express-utils'
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
  async deleteSession(request: Request): Promise<results.JsonResult | results.BadRequestResult | results.NotFoundResult | results.InternalServerErrorResult> {
    try {
      const serviceResponse = await this.httpClient(request.method, `${this.authServerUrl}/session/`)
        .timeout(this.httpCallTimeout)
        .set(request.headers)
        .send({
          uuid: request.params.uuid
        })

      return this.json(serviceResponse.text, serviceResponse.status)
    } catch (error) {
      this.logger.error('Could not pass the request to underlying services')
      this.logger.debug('Response error: %O', error)

      switch(error.status) {
        case 404:
          return this.notFound()
        case 500:
          return this.internalServerError()
        default:
          return this.badRequest()
      }
    }
  }
}
