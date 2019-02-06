import nock from 'nock'
import request from 'superagent'
import url from 'url'
import { createJWKS, createKeyPair, signJwt } from './tools'
export interface JWKSMock {
  start(): void
  stop(): Promise<void>
  kid(): string
  token(token: {}): string
}

const createJWKSMock = (
  jwksHost: string,
  jwksUri: string = url.resolve(jwksHost, '/.well-known/jwks.json')
): JWKSMock => {
  const keypair = createKeyPair()
  const { privateKey } = keypair
  const JWKS = createJWKS({
    ...keypair,
    jwksHost,
  })
  let jwksUrlNock: any
  return {
    start() {
      jwksUrlNock = nock(new url.URL(jwksUri).origin)
        .get(new url.URL(jwksUri).pathname)
        .reply(200, JWKS)
        .persist()
    },
    async stop() {
      if (jwksUrlNock) {
        jwksUrlNock.persist(false)
        await request.get(jwksUri) // Hack to remove the last nock.
      }
    },
    kid() {
      return JWKS.keys[0].kid
    },
    token(token = {}) {
      return signJwt(privateKey, token, this.kid())
    },
  }
}

export default createJWKSMock
