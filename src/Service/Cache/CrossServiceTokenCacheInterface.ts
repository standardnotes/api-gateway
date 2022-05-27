export interface CrossServiceTokenCacheInterface {
  set(authorizationHeaderValue: string, encodedCrossServiceToken: string, expiresInSeconds: number): Promise<void>
  get(authorizationHeaderValue: string): Promise<string | null>
  invalidate(authorizationHeaderValue: string): Promise<void>
}
