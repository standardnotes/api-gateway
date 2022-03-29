import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost } from 'inversify-express-utils'

import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v1/subscription-invites', TYPES.AnalyticsMiddleware)
export class SubscriptionInvitesController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
  ) {
    super()
  }

  @httpPost('/', TYPES.AuthMiddleware)
  async inviteToSubscriptionSharing(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'subscription-invites')
  }

  @httpGet('/:inviteUuid/accept', TYPES.AuthMiddleware)
  async acceptInvite(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `subscription-invites/${request.params.inviteUuid}/accept`)
  }

  @httpGet('/:inviteUuid/decline', TYPES.AuthMiddleware)
  async declineInvite(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `subscription-invites/${request.params.inviteUuid}/decline`)
  }
}
