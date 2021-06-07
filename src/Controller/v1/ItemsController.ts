import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost } from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v1/items', TYPES.AuthMiddleware)
export class ItemsController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
  ) {
    super()
  }

  @httpPost('/')
  async sync(request: Request, response: Response): Promise<void> {
    await this.httpService.callSyncingServer(request, response, 'items/sync', request.body)
  }
}
