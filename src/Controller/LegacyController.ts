import { Request, Response } from 'express'
import { inject } from 'inversify'
import { controller, all, BaseHttpController } from 'inversify-express-utils'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'
import { HttpServiceInterface } from '../Service/HttpClientInterface'

@controller('')
export class LegacyController extends BaseHttpController {
  private AUTH_ROUTES: Map<string, string>
  private PARAMETRIZED_AUTH_ROUTES: Map<string, string>

  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
    super()

    this.AUTH_ROUTES = new Map([
      ['POST:/auth', 'auth'],
      ['POST:/auth/sign_out', 'auth/sign_out'],
      ['POST:/auth/change_pw', 'auth/change_pw'],
      ['GET:/sessions', 'sessions'],
      ['DELETE:/session', 'session'],
      ['DELETE:/session/all', 'session/all'],
      ['POST:/session/refresh', 'session/refresh'],
      ['POST:/auth/sign_in', 'auth/sign_in'],
      ['GET:/auth/params', 'auth/params']
    ])

    this.PARAMETRIZED_AUTH_ROUTES = new Map([
      ['PATCH:/users/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})', 'users/{uuid}']
    ])
  }

  @all('*')
  async legacyProxyToSyncingServer(request: Request, response: Response): Promise<void> {
    if (this.shouldBeRedirectedToAuthService(request)) {
      this.logger.debug(`Proxying legacy request to auth for: ${request.method}:${request.path}`)

      await this.httpService.callAuthServerWithLegacyFormat(request, response, this.getPath(request), request.body)

      return
    }

    this.logger.debug(`Proxying legacy request to syncing server for: ${request.method}:${request.path}`)

    await this.httpService.callLegacySyncingServer(request, response, request.path.substring(1), request.body)
  }

  private getPath(request: Request): string {
    const requestKey = `${request.method}:${request.path}`

    if (this.AUTH_ROUTES.has(requestKey)) {
      return <string> this.AUTH_ROUTES.get(requestKey)
    }

    for (const key of this.AUTH_ROUTES.keys()) {
      const regExp = new RegExp(key)
      const matches = regExp.exec(requestKey)
      if (matches !== null) {
        return (<string> this.AUTH_ROUTES.get(key)).replace('{uuid}', matches[1])
      }
    }

    throw Error('could not find path for key')
  }

  private shouldBeRedirectedToAuthService(request: Request): boolean {
    const requestKey = `${request.method}:${request.path}`

    if (this.AUTH_ROUTES.has(requestKey)) {
      return true
    }

    for (const key of this.PARAMETRIZED_AUTH_ROUTES.keys()) {
      const regExp = new RegExp(key)
      const matches = regExp.test(requestKey)
      if (matches) {
        return true
      }
    }

    return false
  }
}
