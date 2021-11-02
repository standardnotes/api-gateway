import * as winston from 'winston'
import axios, { AxiosInstance } from 'axios'
import { Container } from 'inversify'

import { Env } from './Env'
import TYPES from './Types'
import { AuthMiddleware } from '../Controller/AuthMiddleware'
import { HttpServiceInterface } from '../Service/HttpClientInterface'
import { HttpService } from '../Service/HttpService'
import { SubscriptionTokenAuthMiddleware } from '../Controller/SubscriptionTokenAuthMiddleware'
import { OfflineSubscriptionTokenAuthMiddleware } from '../Controller/OfflineSubscriptionTokenAuthMiddleware'

export class ContainerConfigLoader {
  async load(): Promise<Container> {
    const env: Env = new Env()
    env.load()

    const container = new Container()

    const logger = winston.createLogger({
      level: env.get('LOG_LEVEL') || 'info',
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({ level: env.get('LOG_LEVEL') || 'info' }),
      ],
    })
    container.bind<winston.Logger>(TYPES.Logger).toConstantValue(logger)

    container.bind<AxiosInstance>(TYPES.HTTPClient).toConstantValue(axios.create())

    // env vars
    container.bind(TYPES.SYNCING_SERVER_JS_URL).toConstantValue(env.get('SYNCING_SERVER_JS_URL'))
    container.bind(TYPES.AUTH_SERVER_URL).toConstantValue(env.get('AUTH_SERVER_URL'))
    container.bind(TYPES.PAYMENTS_SERVER_URL).toConstantValue(env.get('PAYMENTS_SERVER_URL', true))
    container.bind(TYPES.AUTH_JWT_SECRET).toConstantValue(env.get('AUTH_JWT_SECRET'))
    container.bind(TYPES.HTTP_CALL_TIMEOUT).toConstantValue(env.get('HTTP_CALL_TIMEOUT', true) ? +env.get('HTTP_CALL_TIMEOUT', true) : 60_000)
    container.bind(TYPES.VERSION).toConstantValue(env.get('VERSION'))

    // Middleware
    container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)
    container.bind<SubscriptionTokenAuthMiddleware>(TYPES.SubscriptionTokenAuthMiddleware).to(SubscriptionTokenAuthMiddleware)
    container.bind<OfflineSubscriptionTokenAuthMiddleware>(TYPES.OfflineSubscriptionTokenAuthMiddleware).to(OfflineSubscriptionTokenAuthMiddleware)

    // Services
    container.bind<HttpServiceInterface>(TYPES.HTTPService).to(HttpService)

    return container
  }
}
