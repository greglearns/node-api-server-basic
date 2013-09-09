var chai = require('chai')
chai.Assertion.includeStack = true
var expect = chai.expect
var inspect = require('eyespect').inspector()

module.exports = {
  expect: expect,
  inspect: inspect
}

