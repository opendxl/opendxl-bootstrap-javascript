'use strict'
/* eslint no-unused-expressions: "off" */ // for chai expect assertions

var expect = require('chai').expect
var Client = require('..').Client

describe('Client', function () {
  it('should preserve the client passed into it', function () {
    var obj = 42
    expect(new Client(obj).dxlClient).to.equal(obj)
  })
})
