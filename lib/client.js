'use strict'

/**
 * @classdesc Responsible for all communication with the
 * Data Exchange Layer (DXL) fabric.
 * @external DxlClient
 * @see {@link https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html}
 */

/**
 * @classdesc Base class used for DXL client wrappers.
 * @param {external:DxlClient} dxlClient - The DXL client to use for
 *   communication with the fabric.
 * @constructor
 */
function Client (dxlClient) {
  /**
   * The DXL client to use for communication with the fabric.
   * @private
   * @type {external.DxlClient}
   * @name Application#_dxlClient
   */
  this._dxlClient = dxlClient
}

module.exports = Client
