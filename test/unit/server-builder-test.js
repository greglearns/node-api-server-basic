var help = require('../test-helper')
var expect = help.expect
var subject = require('../../')

describe('serverBuilder', function() {

  var opts
  var logEntries
  var fakeLog = {
    note: 'I am fake',
    info: function(obj, msg) {
      logEntries.push(msg)
    }
  }
  function goodOpts() {
    logEntries = []
    return {
      port: 0,
      name: 'test name',
      routes: function() {},
      log: fakeLog
    }
  }

  beforeEach(function() {
    opts = goodOpts()
  })

  describe('initialization', function() {

    describe('required fields', function() {

      var requiredFields = [
        'port',
        'name',
        'routes'
      ]

      it('we test all of the required fields', function() {
        expect(function() { subject({}) })
        .to.throw(Error)
        .and.throw(new RegExp('required.*(' + requiredFields.join('|') + ')'))
      })

      requiredFields.forEach(function(field) {
        it(field, function() {
          delete opts[field]
          var callWithMissingField = function() { subject(opts) }
          expect(callWithMissingField)
          .to.throw(Error)
          .and.throw(new RegExp('required.*' + field))
        })
      })

    })

    describe('sets', function() {
      var server
      before(function() {
        server = subject(goodOpts()).server
      })

      it('server.name', function() {
        expect(server.name).to.equal(opts.name)
      })

      it('server.log', function() {
        expect(server.log).to.equal(fakeLog)
        expect(server.log.note).to.equal('I am fake')
      })

    })

    describe('logging', function() {

      it('logs on startup', function(done) {
        opts.postStart = function() {
          expect(logEntries).to.eql([ 'success: server start' ])
          done()
        }
        subject(opts).start()
      })

    })

  })

})

