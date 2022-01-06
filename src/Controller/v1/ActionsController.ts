import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost } from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v1', TYPES.AnalyticsMiddleware)
export class ActionsController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
  ) {
    super()
  }

  @httpPost('/login')
  async login(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'auth/sign_in', request.body)
  }

  @httpGet('/login-params')
  async loginParams(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'auth/params', request.body)
  }

  @httpPost('/logout')
  async logout(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'auth/sign_out', request.body)
  }

  @httpGet('/auth/methods')
  async methods(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'auth/methods', request.body)
  }

  @httpGet('/failed-backups-emails/mute/:settingUuid')
  async muteFailedBackupsEmails(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `settings/email_backup/${request.params.settingUuid}/mute`, request.body)
  }
}
