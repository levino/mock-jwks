import { createJWKS, createKeyPair, signJwt } from './tools'
import * as nock from 'nock'

const createAuth0Mock = () => {
  const keypair = createKeyPair()
  const { privateKey, publicKey } = keypair
  const JWKS = createJWKS(keypair)
  let jwksUrlNock
  return {
    start () {
      jwksUrlNock = nock('https://hardfork.eu.auth0.com')
        .get('/.well-known/jwks.json')
        .reply(200, JWKS)
        .persist()
    },
    stop () {
      jwksUrlNock.persist(false)
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
