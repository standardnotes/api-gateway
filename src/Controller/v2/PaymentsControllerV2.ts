import { Request, Response } from 'express'
import { BaseHttpController, controller, httpDelete, httpGet, httpPatch } from 'inversify-express-utils'
import { inject } from 'inversify'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v2')
export class PaymentsControllerV2 extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface
  ) {
    super()
  }

  @httpGet('/subscriptions')
  async getSubscriptionsWithFeatures(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/subscriptions/features', request.body)
  }

  @httpGet('/subscriptions/:subscriptionId', TYPES.SubscriptionTokenAuthMiddleware)
  async getSubscription(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, `api/subscriptions/${request.params.subscriptionId}`, request.body)
  }

  @httpDelete('/subscriptions/:subscriptionId', TYPES.SubscriptionTokenAuthMiddleware)
  async cancelSubscription(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, `api/subscriptions/${request.params.subscriptionId}`, request.body)
  }

  @httpPatch('/subscriptions/:subscriptionId', TYPES.SubscriptionTokenAuthMiddleware)
  async updateSubscription(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, `api/subscriptions/${request.params.subscriptionId}`, request.body)
  }
}
