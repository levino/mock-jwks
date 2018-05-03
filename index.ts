import * as nock from 'nock'
import * as request from 'superagent'
import { createJWKS, createKeyPair, signJwt } from './tools'

const createJWKSMock = (jwksHost: string) => {
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
