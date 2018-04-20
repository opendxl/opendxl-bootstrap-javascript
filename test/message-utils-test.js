'use strict'
/* eslint no-unused-expressions: "off" */ // for chai expect assertions

var Buffer = require('safe-buffer').Buffer
var expect = require('chai').expect
var Request = require('@opendxl/dxl-client').Request
var MessageUtils = require('..').MessageUtils

describe('MessageUtils', function () {
  context('.decode', function () {
    it('should decode a buffer to a string', function () {
      expect(MessageUtils.decode(Buffer.from('decoded'))).to.equal('decoded')
    })
    it('should preserve a string', function () {
      expect(MessageUtils.decode('decoded')).to.equal('decoded')
    })
  })
  context('.decodePayload', function () {
    it('should decode a buffer type message payload to a string', function () {
      var request = new Request('')
      request.payload = Buffer.from('decoded')
      expect(MessageUtils.decodePayload(request)).to.eql('decoded')
    })
  })
  context('.jsonToObject', function () {
    it('should decode a json string into an object', function () {
      expect(MessageUtils.jsonToObject('{"decodeKey":"decodeValue"}')).to.eql(
        {decodeKey: 'decodeValue'})
    })
    it('should strip a trailing null byte when decoding a string', function () {
      expect(MessageUtils.jsonToObject('{"decodeKey":"decodeValue"}\0')).to.eql(
        {decodeKey: 'decodeValue'})
    })
  })
  context('.jsonPayloadToObject', function () {
    it('should decode a buffer type json message payload to an object',
      function () {
        var request = new Request('')
        request.payload = Buffer.from('{"decodeKey":"decodeValue"}')
        expect(MessageUtils.jsonPayloadToObject(request)).to.eql(
          {decodeKey: 'decodeValue'})
      }
    )
    it('should decode a null terminated json message payload to an object',
      function () {
        var request = new Request('')
        request.payload = Buffer.from('{"decodeKey":"decodeValue"}\0')
        expect(MessageUtils.jsonPayloadToObject(request)).to.eql(
          {decodeKey: 'decodeValue'})
      }
    )
  })
  context('.encode', function () {
    it('should encode a string to a buffer', function () {
      expect(MessageUtils.encode('encoded')).to.eql(Buffer.from('encoded'))
    })
    it('should preserve a buffer', function () {
      expect(MessageUtils.encode(Buffer.from('encoded'))).to.eql(
        Buffer.from('encoded'))
    })
    it('should encode a null value to an empty buffer', function () {
      expect(MessageUtils.encode(null)).to.eql(Buffer.alloc(0))
    })
    it('should encode an object to a buffer', function () {
      expect(MessageUtils.encode({decodeKey: 'decodeValue'})).to.eql(
        Buffer.from('{"decodeKey":"decodeValue"}'))
    })
    it('should encode a number to a buffer', function () {
      expect(MessageUtils.encode(42)).to.eql(Buffer.from('42'))
    })
  })
  context('.encodePayload', function () {
    it('should encode a string to the request payload as a buffer',
      function () {
        var request = new Request('')
        MessageUtils.encodePayload(request, 'encode')
        expect(request.payload).to.eql(Buffer.from('encode'))
      }
    )
    it('should encode an object to the request payload as a buffer',
      function () {
        var request = new Request('')
        MessageUtils.encodePayload(request, {decodeKey: 'decodeValue'})
        expect(request.payload).to.eql(
          Buffer.from('{"decodeKey":"decodeValue"}'))
      }
    )
  })
  context('.objectToJson', function () {
    it('should encode an object to a json string without pretty print',
      function () {
        expect(MessageUtils.objectToJson({decodeKey: 'decodeValue'})).to.eql(
          '{"decodeKey":"decodeValue"}')
      }
    )
    it('should encode an object to a json string with pretty print',
      function () {
        expect(MessageUtils.objectToJson(
          {
            someKey: false,
            anotherKey: '12345',
            yetAnotherKey: 3
          }, true)).to.eql(
          '{\n    "anotherKey": "12345",\n    "someKey": false,\n    ' +
          '"yetAnotherKey": 3\n}')
      }
    )
  })
  context('.objectToJsonPayload', function () {
    it('should encode an object to the request payload as a buffer',
      function () {
        var request = new Request('')
        MessageUtils.objectToJsonPayload(request, {decodeKey: 'decodeValue'})
        expect(request.payload).to.eql(
          Buffer.from('{"decodeKey":"decodeValue"}'))
      }
    )
  })
})
