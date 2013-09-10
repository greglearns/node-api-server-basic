# node-api-server-basic

[![Build Status](https://travis-ci.org/greglearns/node-api-server-basic.png?branch=master)](https://travis-ci.org/greglearns/node-api-server-basic) [![Dependency Status](https://david-dm.org/greglearns/node-api-server-basic.png)](https://david-dm.org/greglearns/node-api-server-basic)

[![NPM](https://nodei.co/npm/api-server-basic.png?downloads=true)](https://nodei.co/npm/api-server-basic/)

Basic Node.js API server that uses Restify and logs in JSON-format to stderr.

## Install

```bash
npm install -S api-server-basic
# install and add to your package.json as a dependency
```

## Usage

```javascript
var serverBuilder = require('api-server-basic')

var requiredParams = {
  port: 0,
    // 0 = server will assign a port. Can be any port number
  name: 'My server',
    // used in logging and if someone does curl --head http://your-server.com/
  routes: aFunctionThatWillBeCalledToConfigureRoutes
    // will be called with opts that include opts.server == <the new server that was setup>
}

var optionalParams = {
  log: aBunyanCompatableLogger,
  logBeforeRouting: false // Default false. Set to true to log all requests before routing occurs.
}

var serverData = serverBuilder(requiredParams)
```

## Starting the server

`serverData.start()`
* convenience function to start
* Returns a promise that is fulfilled with an object `{ port: <the actual port listened on> }`

`serverData.start(callback)`
* convenience function to start the server listening.
* Calls the callback once the server is listening.

`serverData.server`
* the server itself

`serverData.server.address().port`
* the port the server is listening on, which is only set after the server is listening.

`serverData.server.log({something: 'that you want to log'}, "this is a message to show that you can log stuff")`
* server log will appear on stderr in JSON format

```

## Run tests

```bash
npm install
make test
```

## License

MIT

