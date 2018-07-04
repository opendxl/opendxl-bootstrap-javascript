/**
 * @classdesc Responsible for all communication with the
 * Data Exchange Layer (DXL) fabric.
 * @external DxlClient
 * @see {@link https://opendxl.github.io/opendxl-client-javascript/jsdoc/Client.html}
 */

/**
 * Service registration instances are used to register and expose services onto
 * a DXL fabric.
 * @external ServiceRegistrationInfo
 * @see {@link https://opendxl.github.io/opendxl-client-javascript/jsdoc/ServiceRegistrationInfo.html}
 */

'use strict'

var fs = require('fs')
var ini = require('ini')
var path = require('path')
var dxl = require('@opendxl/dxl-client')
var Client = dxl.Client
var Config = dxl.Config

var DXL_CLIENT_CONFIG_FILE = 'dxlclient.config'

/**
 * @classdesc Base class used for DXL applications.
 * @param {String} configDir - The directory containing the application
 *   configuration files.
 * @param {String} appConfigFileName - The name of the application-specific
 *   configuration file.
 * @constructor
 */
function Application (configDir, appConfigFileName) {
  /**
   * The DXL client to use for communication with the fabric.
   * @private
   * @type {external.DxlClient}
   * @name Application#_dxlClient
   */
  this._dxlClient = null
  /**
   * The directory containing the application configuration files.
   * @private
   * @type {String}
   * @name Application#_configDir
   */
  this._configDir = configDir
  /**
   * Full path to the file used to configure the DXL client.
   * @private
   * @type {String}
   * @name Application#_dxlClientConfigPath
   */
  this._dxlClientConfigPath = path.join(configDir, DXL_CLIENT_CONFIG_FILE)
  /**
   * Full path to the application-specifie configuration file.
   * @private
   * @type {String}
   * @name Application#_appConfigPath
   */
  this._appConfigPath = path.join(configDir, appConfigFileName)
  /**
   * Whether or not the application is currently running.
   * @private
   * @type {boolean}
   * @name Application#_running
   */
  this._running = false

  /**
   * Loads the configuration settings from the application-specific
   * configuration file
   * @private
   */
  this._loadConfiguration = function () {
    var configData
    try {
      configData = fs.readFileSync(this._appConfigPath, 'utf-8')
    } catch (err) {
      throw new Error('Unable to read configuration file: ' + err.message)
    }

    var parsedConfig
    try {
      parsedConfig = ini.parse(configData)
    } catch (err) {
      throw new Error('Unable to parse config file: ' + err.message)
    }

    this.onLoadConfiguration(parsedConfig)
  }

  /**
   * Attempts to connect to the DXL fabric.
   * @private
   * @param {Function} [callback=null] - Callback function which should be
   *   invoked after the client has been connected.
   */
  this._dxlConnect = function (callback) {
    var that = this
    var config = Config.createDxlConfigFromFile(this._dxlClientConfigPath)
    this._dxlClient = new Client(config)
    this._dxlClient.connect(function () {
      that.onRegisterEventHandlers()
      that.onRegisterServices()
      that.onDxlConnect()
      if (callback) {
        callback()
      }
    })
  }
}

/**
 * Invoked after the client associated with the application has connected
 * to the DXL fabric.
 */
Application.prototype.onDxlConnect = function () {}

/**
 * Invoked after the application-specific configuration has been loaded
 * @param {Object} config - The application-specific configuration, as an
 *   object parsed from the application-configuration file. For example, the
 *   configuration file could have the following content on disk:
 *
 *   ```ini
 *   [General]
 *   requestPayload = ping
 *   ```
 *
 *   The application could then reference the `requestPayload` setting from the
 *   `config` object as follows:
 *
 *   ```js
 *   var payload = config.General.requestPayload
 *   ```
 */
Application.prototype.onLoadConfiguration = function (config) {}

/**
 * Invoked when event handlers should be registered with the application.
 */
Application.prototype.onRegisterEventHandlers = function () {}

/**
 * Invoked when services should be registered with the application.
 */
Application.prototype.onRegisterServices = function () {}

/**
 * Invoked when the application has started running.
 */
Application.prototype.onRun = function () {}

/**
 * Registers the specified service with the fabric.
 * @param {external:ServiceRegistrationInfo} service - The service to register
 *   with the fabric
 * @param {Function} [callback=null] - An optional callback that will be
 *   invoked when the registration attempt is complete. If an error occurs
 *   during the registration attempt, the first parameter supplied to the
 *   callback contains an {@link Error} with failure details.
 */
Application.prototype.registerServiceAsync = function (service, callback) {
  this._dxlClient.registerServiceAsync(service, callback)
}

/**
 * Runs the application.
 * @param {Function} [callback=null] - An optional callback that will be
 *   invoked after the application has started running. The callback would be
 *   invoked after the DXL client has been connected to the fabric and calls to
 *   register services have been made.
 */
Application.prototype.run = function (callback) {
  if (this._running) {
    throw new Error('The application is already running')
  }

  this._running = true
  this.onRun()

  this._loadConfiguration()
  this._dxlConnect(callback)
}

/**
 * Destroys the application (disconnects from fabric, frees resources, etc.)
 * @param {Function} [callback=null] - An optional callback that will be
 *   invoked after the application has been destroyed.
 */
Application.prototype.destroy = function (callback) {
  if (this._dxlClient) {
    this._dxlClient.destroy(callback)
  }
}

module.exports = Application
