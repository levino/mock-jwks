import { beforeEach, describe, expect, test } from 'vitest'
import { createJWKSMock } from './index.js'
const auth0Mock = createJWKSMock('https://hardfork.eu.auth0.com')

test('cannot start twice, in order to prevent unexpected behaviour', () => {
  auth0Mock.start()
  expect(auth0Mock.start).toThrow('JWKSMock is already started')
})
