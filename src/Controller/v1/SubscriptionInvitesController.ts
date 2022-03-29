import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost } from 'inversify-express-utils'

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

  @httpPost('/:inviteUuid/accept', TYPES.AuthMiddleware)
  async acceptInvite(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `subscription-invites/${request.params.inviteUuid}/accept`)
  }

  @httpPost('/:inviteUuid/decline', TYPES.AuthMiddleware)
  async acceptInvite(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `subscription-invites/${request.params.inviteUuid}/decline`)
  }
}
