var restify = require('restify')
var q = require('q')
var errorAdapter = require('error-adapter')
var loggerBuilder = require('logger-json-stderr')

module.exports = function(originalOpts) {
  throwIfRequiredFieldsMissing([ 'port', 'name', 'routes' ], originalOpts)
  var opts = mergeWithDefaults(originalOpts)

  var server = opts.server = restify.createServer(opts)

  opts.middleware(server)
  opts.routes(opts)

  server.on('listening', logPortOnStartup)
  server.on('error', logErrorOnStartup)
  server.on('after', opts.logAfterResponseSent)
  if (opts.logBeforeRouting) { server.pre( logRequestBeforeRouting ) }

  return {
    server: server,
    start: startServer
  }

  function startServer(cb){
    var deferred = q.defer()

    server.on('listening', returnPortToCallbackOrPromise)
    server.on('error', handleStartupError)
    server.listen(opts.port)

    return deferred.promise

    function returnPortToCallbackOrPromise() {
      var port = server.address().port
      deferred.resolve({ port: port })
      if (cb) { cb(null, { port: port }) }
    }

    function handleStartupError(err) {
      deferred.reject(err)
      if (cb) { cb(err) }
    }

  }

  function mergeWithDefaults(src) {
    var opts = shallowCopy(src)
    if (!opts.middleware) { opts.middleware = addMiddleware }
    if (!opts.log) { opts.log = loggerBuilder({ name: opts.name, style: 'bunyan' }) }
    if (!opts.logThis) { opts.logThis = logThisDefault }
    if (!opts.logAfterResponseSent) { opts.logAfterResponseSent = logAfterResponseSentDefault }

    return opts
  }

  function addMiddleware(server) {
    server.use(restify.bodyParser({ mapParams: true }))
    server.use(restify.requestLogger())
    server.use(restify.fullResponse())
  }

  function logPortOnStartup() {
    var port = server.address().port
    server.log.info({ port: port }, 'success: server start')
    if (typeof opts.postStart == 'function') { opts.postStart() }
  }

  function logErrorOnStartup(err) {
    server.log.error({ error: err, port: opts.port }, 'fail: server start')
  }

  function logRequestBeforeRouting(req, res, next) {
    req.log.info({req: req}, "HTTP request: before Routing");
    return next()
  }

  function logAfterResponseSentDefault(req, res, route, error) {
    var logThis = opts.logThis(req, res, route, error)
    if (!error) { return req.log.info(logThis, "HTTP response") }
    return req.log.error(logThis, "HTTP response")
  }

}

function logThisDefault(req, res, route, error) {
  var logTheseThings = {
    req: req,
    res: res,
    route: route
  }
  if (error) { logTheseThings.error = error }
  return logTheseThings
}

function throwIfRequiredFieldsMissing(required, opts) {
  if (typeof opts != 'object') { throw errorAdapter.create({ message: 'must pass in an object' }) }

  var missing = required.filter(function(field) {
    return opts[field] === undefined || opts[field] === null
  })

  if (missing.length > 0) { throw errorAdapter.create({message: 'required field missing: ' + missing.join(','), missing: missing }) }
}

function shallowCopy(src) {
  var dest = {}
  for(var key in src) {
    if(src.hasOwnProperty(key)) { dest[key] = src[key] }
  }
  return dest
}

