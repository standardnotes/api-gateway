import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost } from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v1')
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

  @httpPost('/logout', TYPES.AuthMiddleware)
  async logout(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'auth/sign_out', request.body)
  }
}
