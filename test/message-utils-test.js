'use strict'
/* eslint no-unused-expressions: "off" */ // for chai expect assertions

const Buffer = require('safe-buffer').Buffer
const expect = require('chai').expect
const Request = require('@opendxl/dxl-client').Request
const MessageUtils = require('..').MessageUtils

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
      const request = new Request('')
      request.payload = Buffer.from('decoded')
      expect(MessageUtils.decodePayload(request)).to.eql('decoded')
    })
  })
  context('.jsonToObject', function () {
    it('should decode a json string into an object', function () {
      expect(MessageUtils.jsonToObject('{"decodeKey":"decodeValue"}')).to.eql(
        { decodeKey: 'decodeValue' })
    })
    it('should strip a trailing null byte when decoding a string', function () {
      expect(MessageUtils.jsonToObject('{"decodeKey":"decodeValue"}\0')).to.eql(
        { decodeKey: 'decodeValue' })
    })
  })
  context('.jsonPayloadToObject', function () {
    it('should decode a buffer type json message payload to an object',
      function () {
        const request = new Request('')
        request.payload = Buffer.from('{"decodeKey":"decodeValue"}')
        expect(MessageUtils.jsonPayloadToObject(request)).to.eql(
          { decodeKey: 'decodeValue' })
      }
    )
    it('should decode a null terminated json message payload to an object',
      function () {
        const request = new Request('')
        request.payload = Buffer.from('{"decodeKey":"decodeValue"}\0')
        expect(MessageUtils.jsonPayloadToObject(request)).to.eql(
          { decodeKey: 'decodeValue' })
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
      expect(MessageUtils.encode({ decodeKey: 'decodeValue' })).to.eql(
        Buffer.from('{"decodeKey":"decodeValue"}'))
    })
    it('should encode a number to a buffer', function () {
      expect(MessageUtils.encode(42)).to.eql(Buffer.from('42'))
    })
  })
  context('.encodePayload', function () {
    it('should encode a string to the request payload as a buffer',
      function () {
        const request = new Request('')
        MessageUtils.encodePayload(request, 'encode')
        expect(request.payload).to.eql(Buffer.from('encode'))
      }
    )
    it('should encode an object to the request payload as a buffer',
      function () {
        const request = new Request('')
        MessageUtils.encodePayload(request, { decodeKey: 'decodeValue' })
        expect(request.payload).to.eql(
          Buffer.from('{"decodeKey":"decodeValue"}'))
      }
    )
  })
  context('.objectToJson', function () {
    it('should encode an object to a json string without pretty print',
      function () {
        expect(MessageUtils.objectToJson({ decodeKey: 'decodeValue' })).to.eql(
          '{"decodeKey":"decodeValue"}')
      }
    )
    it('should encode an object to a json string with pretty print',
      function () {
        expect(MessageUtils.objectToJson(
          {
            booleanProp: false,
            stringProp: '12345',
            numberProp: 3,
            arrayProp: [
              'sub item 1',
              {
                stringSubProp1: 'sub item 2',
                numberSubProp: 42
              },
              {
                stringSubProp3: 'sub item 3',
                nullProp: null
              }
            ],
            objProp: {
              stringSubProp4: 'sub item 4',
              booleanSubProp: true
            }
          }, true)).to.eql(['{',
          '"arrayProp": [',
          '    "sub item 1",',
          '    {',
          '        "numberSubProp": 42,',
          '        "stringSubProp1": "sub item 2"',
          '    },',
          '    {',
          '        "nullProp": null,',
          '        "stringSubProp3": "sub item 3"',
          '    }',
          '],',
          '"booleanProp": false,',
          '"numberProp": 3,',
          '"objProp": {',
          '    "booleanSubProp": true,',
          '    "stringSubProp4": "sub item 4"',
          '},',
          '"stringProp": "12345"'].join('\n    ') + '\n}')
      }
    )
  })
  context('.objectToJsonPayload', function () {
    it('should encode an object to the request payload as a buffer',
      function () {
        const request = new Request('')
        MessageUtils.objectToJsonPayload(request, { decodeKey: 'decodeValue' })
        expect(request.payload).to.eql(
          Buffer.from('{"decodeKey":"decodeValue"}'))
      }
    )
  })
})
