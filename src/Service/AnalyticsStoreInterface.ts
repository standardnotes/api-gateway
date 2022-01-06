export interface AnalyticsStoreInterface {
  incrementSNJSVersionUsage(snjsVersion: string): Promise<void>
  incrementApplicationVersionUsage(applicationVersion: string): Promise<void>
}
