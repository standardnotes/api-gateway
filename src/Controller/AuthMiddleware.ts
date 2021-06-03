import { Token } from '@standardnotes/auth'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { verify } from 'jsonwebtoken'
import { SuperAgentStatic } from 'superagent'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'

@injectable()
export class AuthMiddleware extends BaseMiddleware {
  constructor (
    @inject(TYPES.HTTPClient) private httpClient: SuperAgentStatic,
    @inject(TYPES.AUTH_SERVER_URL) private authServerUrl: string,
    @inject(TYPES.AUTH_JWT_SECRET) private jwtSecret: string,
    @inject(TYPES.Logger) private logger: Logger
  ) {
    super()
  }

  async handler (request: Request, response: Response, next: NextFunction): Promise<void> {
    if (!request.headers.authorization) {
      this.logger.debug('AuthMiddleware invalid-auth: !request.headers.authorization')

      response.status(401).send({
        error: {
          tag: 'invalid-auth',
          message: 'Invalid login credentials.'
        }
      })

      return
    }

    try {
      const authResponse = await this.httpClient
        .post(`${this.authServerUrl}/sessions/validate`)
        .set('Authorization', request.headers.authorization)
        .ok(res => res.status < 500)
        .send()

      this.logger.debug('Auth validation status %s response: %O', authResponse.status, authResponse.body)

      if (authResponse.status > 200) {
        response.setHeader('content-type', authResponse.header['content-type'])
        response.status(authResponse.status).send(authResponse.body)

        return
      }

      response.locals.authToken = authResponse.body.authToken

      const decodedToken = <Token> verify(authResponse.body.authToken, this.jwtSecret, { algorithms: [ 'HS256' ] })

      response.locals.roles = decodedToken.roles
      response.locals.permissions = decodedToken.permissions
    } catch (error) {
      this.logger.error(`Could not pass the request to underlying services: ${error.response ? JSON.stringify(error.response.body) : error.message}`)

      this.logger.debug('Response error: %O', error.response ?? error)

      if (error.response?.header?.['content-type']) {
        response.setHeader('content-type', error.response.header['content-type'])
      }
      response.status(error.status).send(error.response ? error.response.body : error.message)

      return
    }

    return next()
  }
}
