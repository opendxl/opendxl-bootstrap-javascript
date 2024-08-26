/**
 * @module MessageUtils
 * @description Messaging related utility methods
 */

'use strict'

const Buffer = require('safe-buffer').Buffer

/**
 * Base class for the different Data Exchange Layer (DXL) message types.
 * @external Message
 * @see {@link https://opendxl.github.io/opendxl-client-javascript/jsdoc/Message.html}
 */

/**
 * Finds unique key names in an object hierarchy.
 * @param obj - The object to search.
 * @param {Object} keys - Keys found so far. Each property name represents
 *  the name of a unique key which has been found.
 * @param {Array<Object>} stack - Stack of objects above the supplied obj
 *   in the hierarchy.
 * @throws {TypeError} If a circular reference has been found in the object
 *   hierarchy.
 * @private
 */
function findUniqueKeys (obj, keys, stack) {
  if (typeof obj === 'object' && obj) {
    if (stack.indexOf(obj) < 0) {
      stack.push(obj)
    } else {
      throw new TypeError('Converting circular reference to JSON')
    }
    if (obj instanceof Array) {
      obj.forEach(function (element) {
        findUniqueKeys(element, keys, stack)
      })
    } else {
      Object.keys(obj).forEach(function (key) {
        if (!keys[key]) {
          keys[key] = 1
        }
        findUniqueKeys(obj[key], keys, stack)
      })
    }
    stack.pop()
  }
  return keys
}

module.exports = {
  /**
   * Decodes the specified value and returns it.
   * @param {Buffer|String} value - The value.
   * @param {String} encoding - The encoding.
   * @returns {String} The decoded value
   */
  decode: function (value, encoding) {
    encoding = (typeof encoding === 'undefined') ? 'utf8' : encoding
    if (Buffer.isBuffer(value)) {
      value = value.toString(encoding)
    }
    return value
  },
  /**
   * Decodes the specified message's payload and returns it.
   * @param {external:Message} message - The message to parse.
   * @param {String} [encoding=utf8] - The encoding to use.
   * @return {String} The decoded value
   */
  decodePayload: function (message, encoding) {
    return module.exports.decode(message.payload, encoding)
  },
  /**
   * Converts the specified JSON string to an object and returns it.
   * @param {String} jsonString - The JSON string.
   * @return {Object} The object
   */
  jsonToObject: function (jsonString) {
    // The DXL broker may add a trailing null byte to the end of a JSON
    // payload. Strip one off if found before parsing.
    return JSON.parse(jsonString.replace(/\0$/, ''))
  },
  /**
   * Converts the specified message's payload from JSON to an object and returns
   * it.
   * @param {external:Message} message - The DXL message.
   * @param {String} [encoding=utf8] - The encoding of the payload.
   * @returns {Object} The object.
   */
  jsonPayloadToObject: function (message, encoding) {
    return module.exports.jsonToObject(
      module.exports.decodePayload(message, encoding))
  },
  /**
   * Encodes the specified value and returns it.
   * @param value - The value.
   * @param {String} [encoding=utf8] - The encoding of the payload.
   * @returns {Buffer} The encoded value.
   */
  encode: function (value, encoding) {
    encoding = (typeof encoding === 'undefined') ? 'utf8' : encoding
    let returnValue = value
    if (!Buffer.isBuffer(returnValue)) {
      if (value === null) {
        returnValue = ''
      } else if (typeof value === 'object') {
        returnValue = module.exports.objectToJson(value)
      } else if (typeof value !== 'string') {
        returnValue = '' + value
      }
      returnValue = Buffer.from(returnValue, encoding)
    }
    return returnValue
  },
  /**
   * Encodes the specified value and places it in the DXL message's payload.
   * @param {external:Message} message - The DXL message.
   * @param value - The value.
   * @param {String} [encoding=utf8] - The encoding of the payload.
   */
  encodePayload: function (message, value, encoding) {
    message.payload = module.exports.encode(value, encoding)
  },
  /**
   * Converts the specified object to a JSON string and returns it.
   * @param {Object} obj - The object.
   * @param {Boolean} [prettyPrint=false] - Whether to pretty print the JSON.
   * @returns {String} The JSON string.
   */
  objectToJson: function (obj, prettyPrint) {
    let result
    if (prettyPrint) {
      const sortedKeys = Object.keys(findUniqueKeys(obj, {}, [])).sort()
      result = JSON.stringify(obj, sortedKeys, 4)
    } else {
      result = JSON.stringify(obj)
    }
    return result
  },
  /**
   * Converts the specified object to a JSON string and places it in the DXL
   * message's payload.
   * @param {external:Message} message - The DXL message.
   * @param {Object} obj - The object.
   * @param {String} [encoding=utf8] - The encoding of the payload.
   */
  objectToJsonPayload: function (message, obj, encoding) {
    module.exports.encodePayload(message, obj, encoding)
  }
}
