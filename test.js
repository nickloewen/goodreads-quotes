var assert = require('assert')
var rewire = require('rewire')
var getQuotes = rewire('./index')

describe('getPageCount', function () {
  var getPageCount = getQuotes.__get__('getPageCount')

  it('should return a number', function () {
    getPageCount(0).then(r => assert(typeof (r) === Number))
    getPageCount('brainy').then(r => assert(typeof (r) === Number))
  })
})

describe('getPage', function () {
  var getPage = getQuotes.__get__('getPage')

  it('should return a string', function () {
    getPage(0).then(r => assert(typeof (r) === String))
    getPage('brainy').then(r => assert(typeof (r) === String))
  })
})
