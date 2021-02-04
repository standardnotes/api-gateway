import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { SuperAgentStatic } from 'superagent'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'

@injectable()
export class AuthMiddleware extends BaseMiddleware {
  constructor (
    @inject(TYPES.HTTPClient) private httpClient: SuperAgentStatic,
    @inject(TYPES.AUTH_SERVER_URL) private authServerUrl: string,
    @inject(TYPES.Logger) private logger: Logger
  ) {
    super()
  }

  async handler (request: Request, response: Response, next: NextFunction): Promise<void> {
    const authResponse = await this.httpClient
      .post(`${this.authServerUrl}/sessions/validate`)
      .set('Authorization', <string> request.headers.authorization)
      .send()

    this.logger.debug('Auth validation response: %O', authResponse.body)

    if (!authResponse.ok) {
      response.status(authResponse.status).send(authResponse.text)

      return
    }

    response.locals.authToken = authResponse.body.authToken

    return next()
  }
}
