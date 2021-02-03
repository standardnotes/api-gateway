import * as winston from 'winston'
import * as superagent from 'superagent'
import { Container } from 'inversify'

import { Env } from './Env'
import TYPES from './Types'

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

    // env vars
    container.bind(TYPES.SYNCING_SERVER_JS_URL).toConstantValue(env.get('SYNCING_SERVER_JS_URL'))
    container.bind(TYPES.SYNCING_SERVER_RUBY_URL).toConstantValue(env.get('SYNCING_SERVER_RUBY_URL'))
    container.bind(TYPES.AUTH_SERVER_URL).toConstantValue(env.get('AUTH_SERVER_URL'))
    container.bind(TYPES.HTTP_CALL_TIMEOUT).toConstantValue(env.get('HTTP_CALL_TIMEOUT'))

    // Services
    container.bind<superagent.SuperAgentStatic>(TYPES.HTTPClient).toConstantValue(superagent)

    return container
  }
}
