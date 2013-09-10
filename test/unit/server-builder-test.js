var help = require('../test-helper')
var expect = help.expect
var subject = require('../../')

describe('serverBuilder', function() {

  var slowThresholdInMilliseconds = 200
  this.slow(slowThresholdInMilliseconds) // we are starting and stopping servers before each test

  var opts

  beforeEach(function() {
    opts = goodOpts()
  })

  function goodOpts() {
    return {
      port: 0,
      name: 'test name',
      routes: function() {},
      log: fakeLog()
    }
  }

  describe('initialization', function() {

    describe('required fields', function() {

      var requiredFields = [
        'port',
        'name',
        'routes'
      ]

      requiredFields.forEach(function(field) {
        it(field, function() {
          delete opts[field]
          var callWithMissingField = function() { subject(opts) }
          expect(callWithMissingField)
          .to.throw(Error)
          .and.throw(new RegExp('required.*' + field))
        })
      })

      it('the server does not have a required field that we are not testing for', function() {
        try {
          subject({})
          throw new Error('this line should not be hit.')
        } catch (err) {
          var unknownRequiredField = err.missing.filter(function(element) { return requiredFields.indexOf(element) < 0 })
          expect(unknownRequiredField).to.be.empty
        }
      })

    })

    describe('input / output', function() {
      var server, cachedGoodOpts, serverData

      before(function() { // optimized: starts the server only once
        cachedGoodOpts = goodOpts()
        serverData = subject(cachedGoodOpts)
        server = serverData.server
      })

      describe('returns', function() {
        it('serverData.server', function() {
          expect(serverData).to.have.ownProperty('server')
        })

        it('serverData.start function', function() {
          expect(serverData).to.have.ownProperty('start')
          expect(serverData.start).to.be.a('function')
        })
      })

      describe('sets', function() {

        it('serverData.server.name', function() {
          expect(server.name).to.equal(cachedGoodOpts.name)
        })

        it('serverData.server.log', function() {
          expect(server.log).to.equal(cachedGoodOpts.log)
        })
      })
    })

    describe('logging', function() {

      it('logs on startup', function(done) {
        opts.postStart = function() {
          expect(opts.log.entries).to.eql([ 'success: server start' ])
          done()
        }
        subject(opts).start()
      })
    })

  })
})

function fakeLog() {
  var logEntries = []
  return {
    info: function(obj, msg) {
      logEntries.push(msg)
    },
    entries: logEntries
  }
}

