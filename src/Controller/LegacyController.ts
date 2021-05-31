import { Request, Response } from 'express'
import { inject } from 'inversify'
import { controller, all, BaseHttpController } from 'inversify-express-utils'
import { Logger } from 'winston'
import TYPES from '../Bootstrap/Types'
import { HttpServiceInterface } from '../Service/HttpClientInterface'

@controller('')
export class LegacyController extends BaseHttpController {
  private AUTH_ROUTES: Map<string, string>

  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
    @inject(TYPES.Logger) private logger: Logger,
  ) {
    super()

    this.AUTH_ROUTES = new Map([
      ['POST:/auth', 'auth'],
      ['POST:/auth/sign_out', 'auth/sign_out'],
      ['POST:/auth/change_pw', 'auth/change_pw']
    ])
  }

  @all('*')
  async legacyProxyToSyncingServer(request: Request, response: Response): Promise<void> {
    if (this.shouldBeRedirectedToAuthService(request)) {
      this.logger.debug(`Proxying legacy request to auth for: ${request.method}:${request.path}`)

      await this.httpService.callAuthServerWithLegacyFormat(request, response, <string> this.AUTH_ROUTES.get(`${request.method}:${request.path}`), request.body)

      return
    }

    this.logger.debug(`Proxying legacy request to syncing server for: ${request.method}:${request.path}`)

    await this.httpService.callLegacySyncingServer(request, response, request.path.substring(1), request.body)
  }

  private shouldBeRedirectedToAuthService(request: Request): boolean {
    return this.AUTH_ROUTES.has(`${request.method}:${request.path}`)
  }
}
