import 'reflect-metadata'

import 'newrelic'

import { Logger } from 'winston'

import { ContainerConfigLoader } from '../src/Bootstrap/Container'
import TYPES from '../src/Bootstrap/Types'
import { Env } from '../src/Bootstrap/Env'
import { DomainEventPublisherInterface, DailyVersionAdoptionReportGeneratedEvent } from '@standardnotes/domain-events'
import { AnalyticsActivity, AnalyticsStoreInterface } from '@standardnotes/analytics'


const requestReport = async (
  analyticsStore: AnalyticsStoreInterface,
  domainEventPublisher: DomainEventPublisherInterface,
): Promise<void> => {
  const event: DailyVersionAdoptionReportGeneratedEvent = {
    type: 'DAILY_VERSION_ADOPTION_REPORT_GENERATED',
    createdAt: new Date(),
    meta: {
      correlation: {
        userIdentifier: '',
        userIdentifierType: 'uuid',
      },
    },
    payload: {
      applicationStatistics: await analyticsStore.getYesterdayApplicationUsage(),
      snjsStatistics: await analyticsStore.getYesterdaySNJSUsage(),
      outOfSyncIncidents: await analyticsStore.getYesterdayOutOfSyncIncidents(),
      activityStatistics: [
        {
          name: AnalyticsActivity.EditingItems,
          retention: await analyticsStore.calculateActivityRetentionForYesterday(AnalyticsActivity.EditingItems),
        },
      ],
    },
  }

  await domainEventPublisher.publish(event)
}

const container = new ContainerConfigLoader
void container.load().then(container => {
  const env: Env = new Env()
  env.load()

  const logger: Logger = container.get(TYPES.Logger)

  logger.info('Starting usage report generation...')

  const analyticsStore: AnalyticsStoreInterface = container.get(TYPES.AnalyticsStore)
  const domainEventPublisher: DomainEventPublisherInterface = container.get(TYPES.DomainEventPublisher)

  Promise
    .resolve(requestReport(
      analyticsStore,
      domainEventPublisher,
    ))
    .then(() => {
      logger.info('Usage report generation complete')

      process.exit(0)
    })
    .catch((error) => {
      logger.error(`Could not finish usage report generation: ${error.message}`)

      process.exit(1)
    })
})
