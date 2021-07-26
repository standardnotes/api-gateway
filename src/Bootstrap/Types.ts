const TYPES = {
  Logger: Symbol.for('Logger'),
  HTTPClient: Symbol.for('HTTPClient'),
  // env vars
  SYNCING_SERVER_JS_URL: Symbol.for('SYNCING_SERVER_JS_URL'),
  AUTH_SERVER_URL: Symbol.for('AUTH_SERVER_URL'),
  PAYMENTS_SERVER_URL: Symbol.for('PAYMENTS_SERVER_URL'),
  AUTH_JWT_SECRET: Symbol.for('AUTH_JWT_SECRET'),
  VERSION: Symbol.for('VERSION'),
  // Middleware
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  // Services
  HTTPService: Symbol.for('HTTPService')
}

export default TYPES
