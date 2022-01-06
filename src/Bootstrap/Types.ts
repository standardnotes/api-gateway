const TYPES = {
  Logger: Symbol.for('Logger'),
  Redis: Symbol.for('Redis'),
  HTTPClient: Symbol.for('HTTPClient'),
  // env vars
  SYNCING_SERVER_JS_URL: Symbol.for('SYNCING_SERVER_JS_URL'),
  AUTH_SERVER_URL: Symbol.for('AUTH_SERVER_URL'),
  PAYMENTS_SERVER_URL: Symbol.for('PAYMENTS_SERVER_URL'),
  AUTH_JWT_SECRET: Symbol.for('AUTH_JWT_SECRET'),
  HTTP_CALL_TIMEOUT: Symbol.for('HTTP_CALL_TIMEOUT'),
  VERSION: Symbol.for('VERSION'),
  // Middleware
  AnalyticsMiddleware: Symbol.for('AnalyticsMiddleware'),
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  SubscriptionTokenAuthMiddleware: Symbol.for('SubscriptionTokenAuthMiddleware'),
  // Services
  HTTPService: Symbol.for('HTTPService'),
  AnalyticsStore: Symbol.for('AnalyticsStore'),
}

export default TYPES
