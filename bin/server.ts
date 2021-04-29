import 'reflect-metadata'

import 'newrelic'

import '../src/Controller/LegacyController'
import '../src/Controller/HealthCheckController'
import '../src/Controller/v1/SessionsController'
import '../src/Controller/v1/UsersController'
import '../src/Controller/v1/ActionsController'
import '../src/Controller/v1/RevisionsController'

import * as helmet from 'helmet'
import * as cors from 'cors'
import { urlencoded, json } from 'express'
import * as prettyjson from 'prettyjson'
import * as expressWinston from 'express-winston'
import * as winston from 'winston'

import { InversifyExpressServer, getRouteInfo } from 'inversify-express-utils'
import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'

const container = new ContainerConfigLoader
void container.load().then(container => {
  const server = new InversifyExpressServer(container)

  server.setConfig((app) => {
    /* eslint-disable */
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["https: 'self'"],
          baseUri: ["'self'"],
          childSrc: ["*", "blob:"],
          connectSrc: ["*"],
          fontSrc: ["*", "'self'"],
          formAction: ["'self'"],
          frameAncestors: ["*", "*.standardnotes.org", "*.standardnotes.com"],
          frameSrc: ["*", "blob:"],
          imgSrc: ["'self'", "*", "data:"],
          manifestSrc: ["'self'"],
          mediaSrc: ["'self'"],
          objectSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"]
        }
      }
    }))
    /* eslint-enable */
    app.use(json({ limit: '50mb' }))
    app.use(urlencoded({ extended: true, limit: '50mb', parameterLimit: 5000 }))
    app.use(cors())

    app.use(expressWinston.logger({
      transports: [
          new winston.transports.Console({
              format: winston.format.json(),
          }),
      ],
      ignoreRoute: function (req, _res) { return ['/healthcheck', '/favicon.ico'].indexOf(req.path.replace(/\/$/, '')) >= 0 },
    }))
  })

  const serverInstance = server.build()

  const routeInfo = getRouteInfo(container)

  console.log(prettyjson.render({ routes: routeInfo }))

  const env: Env = new Env()
  env.load()

  serverInstance.listen(env.get('PORT'))

  const logger: winston.Logger = container.get(TYPES.Logger)

  logger.info(`Server started on port ${process.env.PORT}`)
})
