import { Token } from '@standardnotes/auth'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { BaseMiddleware } from 'inversify-express-utils'
import { verify } from 'jsonwebtoken'
import { AxiosInstance } from 'axios'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'

@injectable()
export class SubscriptionTokenAuthMiddleware extends BaseMiddleware {
  constructor (
    @inject(TYPES.HTTPClient) private httpClient: AxiosInstance,
    @inject(TYPES.AUTH_SERVER_URL) private authServerUrl: string,
    @inject(TYPES.AUTH_JWT_SECRET) private jwtSecret: string,
    @inject(TYPES.Logger) private logger: Logger
  ) {
    super()
  }

  async handler (request: Request, response: Response, next: NextFunction): Promise<void> {
    const subscriptionToken = request.query.subscription_token
    if (!subscriptionToken) {
      response.status(401).send({
        error: {
          tag: 'invalid-auth',
          message: 'Invalid login credentials.'
        }
      })

      return
    }

    try {
      const authResponse = await this.httpClient.request({
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        validateStatus: (status: number) => {
          return status >= 200 && status < 500
        },
        url: `${this.authServerUrl}/subscription-tokens/${subscriptionToken}/validate`,
      })

      this.logger.debug('Auth validation status %s response: %O', authResponse.status, authResponse.data)

      if (authResponse.status > 200) {
        response.setHeader('content-type', authResponse.headers['content-type'])
        response.status(authResponse.status).send(authResponse.data)

        return
      }

      response.locals.authToken = authResponse.data.authToken

      const decodedToken = <Token> verify(authResponse.data.authToken, this.jwtSecret, { algorithms: [ 'HS256' ] })

      response.locals.userUuid = decodedToken.user.uuid
      response.locals.roles = decodedToken.roles
    } catch (error) {
      this.logger.error(`Could not pass the request to ${this.authServerUrl}/subscription-tokens/${subscriptionToken}/validate on underlying service: ${error.response ? JSON.stringify(error.response.body) : error.message}`)

      this.logger.debug('Response error: %O', error.response ?? error)

      if (error.response?.header?.['content-type']) {
        response.setHeader('content-type', error.response.header['content-type'])
      }
      response.status(error.status || 500).send(error.response ? error.response.body : error.message)

      return
    }

    return next()
  }
}
