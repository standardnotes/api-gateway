import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpPost } from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v1/sockets')
export class WebSocketsController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
  ) {
    super()
  }

  @httpPost('/connect')
  async connect(_request: Request, response: Response): Promise<void> {
    response.status(200).send('OK')
  }

  @httpPost('/')
  async createWebSocketConnection(request: Request, response: Response): Promise<void> {
    await this.httpService.callAuthServer(request, response, 'sockets', request.body)
  }
}
