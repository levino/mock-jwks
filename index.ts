import nock from 'nock'
import request from 'superagent'
import { createJWKS, createKeyPair, signJwt } from './tools'

export interface JWKSMock {
  start(): void
  stop(): Promise<void>
  kid(): string
  token(token: {}): string
}

const createJWKSMock = (jwksHost: string): JWKSMock => {
  const keypair = createKeyPair()
  const { privateKey } = keypair
  const JWKS = createJWKS({
    ...keypair,
    jwksHost,
  })
  let jwksUrlNock: any
  return {
    start() {
      jwksUrlNock = nock(`${jwksHost}`)
        .get('/.well-known/jwks.json')
        .reply(200, JWKS)
        .persist()
    },
    async stop() {
      if (jwksUrlNock) {
        jwksUrlNock.persist(false)
        await request.get(`${jwksHost}/.well-known/jwks.json`)
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
