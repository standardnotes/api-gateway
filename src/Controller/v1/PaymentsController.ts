import { Request, Response } from 'express'
import { inject } from 'inversify'
import { all, BaseHttpController, controller, httpDelete, httpGet, httpPost } from 'inversify-express-utils'
import TYPES from '../../Bootstrap/Types'
import { HttpServiceInterface } from '../../Service/HttpClientInterface'

@controller('/v1')
export class PaymentsController extends BaseHttpController {
  constructor(
    @inject(TYPES.HTTPService) private httpService: HttpServiceInterface,
  ) {
    super()
  }

  @httpGet('/downloads')
  async downloads(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/downloads', request.body)
  }

  @httpGet('/downloads/download-info')
  async downloadInfo(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/downloads/download-info', request.body)
  }

  @httpGet('/downloads/platforms')
  async platformDownloads(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/downloads/platforms', request.body)
  }

  @httpGet('/help/categories')
  async categoriesHelp(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/help/categories', request.body)
  }

  @httpGet('/knowledge/categories')
  async categoriesKnowledge(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/knowledge/categories', request.body)
  }

  @httpGet('/extensions')
  async extensions(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/extensions', request.body)
  }

  @all('/subscriptions')
  async subscriptions(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/subscriptions', request.body)
  }

  @httpGet('/reset/validate')
  async validateReset(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/reset/validate', request.body)
  }

  @httpDelete('/reset')
  async reset(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/reset', request.body)
  }

  @httpPost('/reset')
  async resetRequest(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/reset', request.body)
  }

  @httpPost('/students')
  async students(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/students', request.body)
  }

  @httpPost('/students/:token/approve')
  async studentsApprove(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, `api/students/${request.params.token}/approve`, request.body)
  }

  @httpPost('/email_subscriptions/:token/less')
  async subscriptionsLess(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, `api/email_subscriptions/${request.params.token}/less`, request.body)
  }

  @httpPost('/email_subscriptions/:token/more')
  async subscriptionsMore(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, `api/email_subscriptions/${request.params.token}/more`, request.body)
  }

  @httpPost('/email_subscriptions/:token/mute/:campaignId')
  async subscriptionsMute(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, `api/email_subscriptions/${request.params.token}/mute/${request.params.campaignId}`, request.body)
  }

  @httpPost('/email_subscriptions/:token/unsubscribe')
  async subscriptionsUnsubscribe(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, `api/email_subscriptions/${request.params.token}/unsubscribe`, request.body)
  }

  @all('/pro_users(/*)?')
  async proUsers(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, request.path.replace('v1', 'api'), request.body)
  }

  @all('/refunds')
  async refunds(request: Request, response: Response): Promise<void> {
    await this.httpService.callPaymentsServer(request, response, 'api/refunds', request.body)
  }
}