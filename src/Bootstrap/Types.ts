const TYPES = {
  Logger: Symbol.for('Logger'),
  HTTPClient: Symbol.for('HTTPClient'),
  // env vars
  SYNCING_SERVER_JS_URL: Symbol.for('SYNCING_SERVER_JS_URL'),
  SYNCING_SERVER_RUBY_URL: Symbol.for('SYNCING_SERVER_RUBY_URL'),
  AUTH_SERVER_URL: Symbol.for('AUTH_SERVER_URL'),
  HTTP_CALL_TIMEOUT: Symbol.for('HTTP_CALL_TIMEOUT'),
  // Middleware
  AuthMiddleware: Symbol.for('AuthMiddleware'),
  // Services
  HTTPService: Symbol.for('HTTPService')
}

export default TYPES
