import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpDelete, httpPost } from 'inversify-express-utils'
import { Logger } from 'winston'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v1/sockets')
export class WebSocketsController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
    super()
  }

  @httpPost('/', TYPES.AuthMiddleware)
  async createWebSocketConnection(request: Request, response: Response): Promise<void> {
    this.logger.debug(`WebSockets connection persisting request:
      headers: ${JSON.stringify(request.headers)},
      body: ${JSON.stringify(request.body)}`)

    if (!request.headers.connectionid) {
      response.status(400).send('Missing connection id in the request')

      return
    }

    await this.httpService.callAuthServer(request, response, `sockets/${request.headers.connectionid}`, request.body)
  }

  @httpDelete('/')
  async deleteWebSocketConnection(request: Request, response: Response): Promise<void> {
    this.logger.debug(`WebSockets connection removing request:
      headers: ${JSON.stringify(request.headers)},
      body: ${JSON.stringify(request.body)}`)

    if (!request.headers.connectionid) {
      response.status(400).send('Missing connection id in the request')

      return
    }

    await this.httpService.callAuthServer(request, response, `sockets/${request.headers.connectionid}`, request.body)
  }
}
