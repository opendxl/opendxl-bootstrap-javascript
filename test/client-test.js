'use strict'
/* eslint no-unused-expressions: "off" */ // for chai expect assertions

const expect = require('chai').expect
const Client = require('..').Client

describe('Client', function () {
  it('should preserve the client passed into it', function () {
    const obj = 42
    expect(new Client(obj)._dxlClient).to.equal(obj)
  })
})
