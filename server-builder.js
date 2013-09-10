var restify = require('restify')
var q = require('q')

try {
  var loggerBuilder = require('logger-json-stderr')
} catch (er) {
  loggerBuilder = null
}

module.exports = function(originalOpts) {
  if (typeof originalOpts != 'object') { throw new Error('must pass in an object') }
  if (originalOpts.port !== 0 && !originalOpts.port) { throw new Error('required field missing: port') }
  if (!originalOpts.name) { throw new Error('required field missing: name') }
  if (!originalOpts.routes) { throw new Error('required field missing: routes') }
  if (!originalOpts.log && !loggerBuilder) { throw new Error('required option missing: log') }

  var opts = mergeWithDefaults(originalOpts)

  var server = opts.server = restify.createServer(opts)
  opts.middleware(server)
  opts.routes(opts)
  server.on('after', opts.logAfterResponseSent)

  // server.pre( function (req, res, next) { req.log.info({req: req}, "HTTP request") next() })

  server.on('listening', function() {
    opts.port = server.address().port
    server.log.info({ port: opts.port }, 'success: server start')
    if (typeof opts.postStart == 'function') { opts.postStart() }
  })

  return {
    server: server,
    start: startServer
  }

  function startServer(cb){
    var deferred = q.defer()

    server.on('listening', function() {
      deferred.resolve({ port: server.address().port })
      if (cb) { cb(null, server.address().port) }
    })

    server.on('error', function(err) {
      server.log.error({ error: err, port: opts.port }, 'fail: server start')
      deferred.reject(err)
    })

    server.listen(opts.port)
    return deferred.promise
  }

  function mergeWithDefaults(src) {
    var opts = shallowCopy(src)
    if (!opts.middleware) { opts.middleware = addMiddleware }
    if (!opts.log) { opts.log = loggerBuilder({ name: opts.name, style: 'bunyan' }) }
    if (!opts.logThis) { opts.logThis = logThis }
    if (!opts.logAfterResponseSent) { opts.logAfterResponseSent = logAfterResponseSent }

    return opts
  }

  function addMiddleware(server) {
    server.use(restify.bodyParser({ mapParams: true }))
    server.use(restify.requestLogger())
    server.use(restify.fullResponse())
  }

  function logThis(req, res, route, error) {
    var logTheseThings = { req: req, res: res, route: route }
    if (error) { logTheseThings.error = error }
    return logTheseThings
  }

  function logAfterResponseSent (req, res, route, error) {
    var logThis = opts.logThis(req, res, route, error)
    if (!error) { return req.log.info(logThis, "HTTP response") }
    return req.log.error(logThis, "HTTP response")
  }

}

function shallowCopy(src) {
  var dest = {}
  for(var key in src) {
    if(src.hasOwnProperty(key)) { dest[key] = src[key] }
  }
  return dest
}

