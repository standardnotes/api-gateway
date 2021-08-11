import { Request, Response } from 'express'
import { inject } from 'inversify'
import { all, BaseHttpController, controller, httpDelete, httpGet, httpPatch, httpPost, httpPut, results } from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v1/users')
export class UsersController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
  ) {
    super()
  }

  @httpPatch('/:userId', TYPES.AuthMiddleware)
  async updateUser(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `users/${request.params.userId}`, request.body)
  }

  @httpPut('/:userId/password', TYPES.AuthMiddleware)
  async changePassword(request: Request, response: Response): Promise<void> {
    request.method = 'POST'
    await this.httpService.callAuthServer(request, response, 'auth/change_pw', request.body)
  }

  @httpGet('/:userId/params', TYPES.AuthMiddleware)
  async getKeyParams(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'auth/params')
  }

  @all('/:userId/mfa', TYPES.AuthMiddleware)
  async blockMFA(): Promise<results.StatusCodeResult> {
    return this.statusCode(401)
  }

  @httpPost('/')
  async register(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'auth', request.body)
  }

  @httpGet('/:userUuid/settings', TYPES.AuthMiddleware)
  async listSettings(request:Request, response:Response):Promise<void> {
    await this.httpService.callAuthServer(request, response, `users/${request.params.userUuid}/settings`)
  }

  @httpPut('/:userUuid/settings', TYPES.AuthMiddleware)
  async putSetting(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `users/${request.params.userUuid}/settings`, request.body)
  }

  @httpGet('/:userUuid/settings/:settingName', TYPES.AuthMiddleware)
  async getSetting(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `users/${request.params.userUuid}/settings/${request.params.settingName}`)
  }

  @httpDelete('/:userUuid/settings/:settingName', TYPES.AuthMiddleware)
  async deleteSetting(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `users/${request.params.userUuid}/settings/${request.params.settingName}`, request.body)
  }

  @httpGet('/:userUuid/features', TYPES.AuthMiddleware)
  async getFeatures(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, `users/${request.params.userUuid}/features`)
  }
}
