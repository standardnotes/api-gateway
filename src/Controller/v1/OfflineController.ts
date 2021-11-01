import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost } from 'inversify-express-utils'

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

  @httpPost('/subscription-tokens')
  async createOfflineSubscriptionToken(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'offline/subscription-tokens', request.body)
  }

  @httpPost('/subscription-tokens/:token/validate')
  async validateOfflineSubscriptionToken(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `offline/subscription-tokens/${request.params.token}/validate`, request.body)
  }
}
