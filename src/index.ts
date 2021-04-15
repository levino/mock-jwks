import nock from 'nock'
import { createJWKS, createKeyPair, signJwt } from './tools'
export interface JWKSMock {
  start(): void
  stop(): Promise<void>
  kid(): string
  token(token: Record<string, unknown>): string
}

const createJWKSMock = (
  jwksOrigin: string,
  jwksPath = '/.well-known/jwks.json'
): JWKSMock => {
  const keypair = createKeyPair()
  const JWKS = createJWKS({
    ...keypair,
    jwksOrigin,
  })
  let jwksUrlInterceptor: nock.Interceptor
  let jwksNockScope: nock.Scope
  return {
    start() {
      jwksUrlInterceptor = nock(jwksOrigin).get(jwksPath)
      jwksNockScope = jwksUrlInterceptor.reply(200, JWKS).persist()
    },
    async stop() {
      if (jwksUrlInterceptor) {
        jwksNockScope.persist(false)
        nock.removeInterceptor(jwksUrlInterceptor)
      }
    },
    kid() {
      return JWKS.keys[0].kid
    },
    token(token = {}) {
      return signJwt(keypair.privateKey, token, this.kid())
    },
  }
}

export default createJWKSMock
