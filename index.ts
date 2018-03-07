import { createJWKS, createKeyPair, signJwt } from './tools'
import * as nock from 'nock'
import request from 'superagent'
const createAuth0Mock = (jkwsHost) => {
  const keypair = createKeyPair()
  const { privateKey, publicKey } = keypair
  const JWKS = createJWKS(keypair)
  let jwksUrlNock
  return {
    start () {
      jwksUrlNock = nock(`${jkwsHost}`)
        .get('/.well-known/jwks.json')
        .reply(200, JWKS)
        .persist()
    },
    async stop () {
      if (jwksUrlNock) {
        jwksUrlNock.persist(false)
        try {
          await request(`${jkwsHost}/.well-known/jwks.json`)
        } catch (err) {
        }
      }
    },
    kid () {
      return JWKS.keys[0].kid
    },
    token (token = {}) {
      return signJwt(privateKey, token, this.kid())
    }
  }
}

export default createAuth0Mock
