import nock from 'nock'
import request from 'superagent'
import url from 'url'
import { createJWKS, createKeyPair, signJwt } from './tools'
export interface JWKSMock {
  start(): void
  stop(): Promise<void>
  kid(): string
  token(token: {}): string
  jwks: object
}

const createJWKSMock = (
  jwksOrigin: string,
  jwksPath: string = '/.well-known/jwks.json'
): JWKSMock => {
  const keypair = createKeyPair()
  const { privateKey } = keypair
  const JWKS = createJWKS({
    ...keypair,
    jwksOrigin,
  })
  let jwksUrlNock: any
  return {
    start() {
      jwksUrlNock = nock(jwksOrigin)
        .get(jwksPath)
        .reply(200, JWKS)
        .persist()
    },
    async stop() {
      if (jwksUrlNock) {
        jwksUrlNock.persist(false)
        await request.get(url.resolve(jwksOrigin, jwksPath)) // Hack to remove the last nock.
      }
    },
    kid() {
      return JWKS.keys[0].kid
    },
    token(token = {}) {
      return signJwt(privateKey, token, this.kid())
    },
    jwks: JWKS,
  }
}

export default createJWKSMock
