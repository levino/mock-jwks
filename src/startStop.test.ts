import { beforeEach, describe, expect, test } from 'vitest'
import { createJWKSMock } from './index.js'
const auth0Mock = createJWKSMock('https://hardfork.eu.auth0.com')

test('Can start twice, then stop, then start again', () => {
  auth0Mock.start()
  auth0Mock.start()
  auth0Mock.stop()
  expect(auth0Mock.start).not.toThrow()
})
