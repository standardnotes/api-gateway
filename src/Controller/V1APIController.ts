import { Request } from 'express'
import { inject } from 'inversify'
import { all, BaseHttpController, controller, results } from 'inversify-express-utils'
import { SuperAgentStatic } from 'superagent'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'

@controller('/v1')
export class V1APIController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPClient) private httpClient: SuperAgentStatic,
    @inject(TYPES.HTTP_CALL_TIMEOUT) private httpCallTimeout: number,
    @inject(TYPES.SYNCING_SERVER_JS_URL) private syncingServerJsUrl: string,
    @inject(TYPES.Logger) private logger: Logger
  ) {
    super()
  }

  @all('/auth*')
  async auth(request: Request): Promise<results.JsonResult | results.BadRequestResult | results.NotFoundResult | results.InternalServerErrorResult> {
    return this.passThrough(request)
  }

  @all('/session*')
  async session(request: Request): Promise<results.JsonResult | results.BadRequestResult | results.NotFoundResult | results.InternalServerErrorResult> {
    return this.passThrough(request)
  }

  private async passThrough(request: Request): Promise<results.JsonResult | results.BadRequestResult | results.NotFoundResult | results.InternalServerErrorResult> {
    try {
      const serviceResponse = await this.httpClient(
          request.method,
          `${this.syncingServerJsUrl}/${request.path.replace('/v1/', '')}`
        )
        .timeout(this.httpCallTimeout)
        .set(request.headers)
        .query(request.params)
        .send()

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
