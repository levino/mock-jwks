# mock-jwks

A tool to mock a JWKS authentication service for development of microservices CONSUMING authentication and authorization jwts.

## Breaking changes

As of version 2 and march 2023 this package is a [pure esm package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). I made an [example](https://github.com/levino/use-mock-jwks/tree/4fd1622af213006dc7be32902273621bbe7aff3e) on how to use the module. Use version 1 for a commonjs version.

## Background

If you use jtws for authentication and authorization of your users against your microservices, you want to automatically unit
test the authentication in your microservice for security. Happy and unhappy paths. Doing this while actually using a running JWKS
deployment (like the auth0 backend) is slow and annoying, so e.g. auth0 suggest you mock their api. This turns out to be
somewhat difficult, especially in the case of using RSA for signing of the tokens and not wanting to heavily dependency inject the middleware for
authentication in your koa or express app. This is why I made this tool, which requires less changes to your code.

## Usage

Please see the [example test](example/authentication.test.js) of a simple [koa app](example/api.js). Usage for `express`, `hapi` or `graphql` is similar.

## Under the hood

`createJWKSMock` will create a local PKI and generate a working JWKS.json. Calling `jwksMock.start()` will use [nock](https://www.npmjs.com/package/nock)
to intercept all calls to `` `${ jwksOrigin }${ jwksPath || '/.well-known/jwks.json' }` ``. So when the `jwks-rsa` middleware gets a token to validate
it will fetch the key to verify against from our local PKI instead of the production one and as such, the token is valid
when signed with the local private key.

## Contributing

You found a bug or want to improve the software? Thank you for your support! Before you open a PR I kindly invite you to read about [best practices](https://eli.thegreenplace.net/2019/how-to-send-good-pull-requests-on-github/) and subject your contribution to them.
