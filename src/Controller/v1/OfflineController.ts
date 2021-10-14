import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v1/offline')
export class OfflineController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
  ) {
    super()
  }

  @httpGet('/features')
  async getOfflineFeatures(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'offline/features', request.body)
  }
}
