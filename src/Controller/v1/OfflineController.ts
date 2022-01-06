import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v1/offline', TYPES.AnalyticsMiddleware)
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

  @httpPost('/payments/stripe-setup-intent')
  async createStripeSetupIntent(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/pro_users/stripe-setup-intent/offline', request.body)
  }
}
