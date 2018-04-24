'use strict'

var fs = require('fs')
var ini = require('ini')
var path = require('path')
var dxl = require('@opendxl/dxl-client')
var Client = dxl.Client
var Config = dxl.Config

var DXL_CLIENT_CONFIG_FILE = 'dxlclient.config'

function Application (configDir, appConfigFileName) {
  this.dxlClient = null
  this._configDir = configDir
  this._dxlClientConfigPath = path.join(configDir, DXL_CLIENT_CONFIG_FILE)
  this._appConfigPath = path.join(configDir, appConfigFileName)
  this._running = false

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

  this._dxlConnect = function (callback) {
    var that = this
    var config = Config.createDxlConfigFromFile(this._dxlClientConfigPath)
    this.dxlClient = new Client(config)
    this.dxlClient.connect(function () {
      that.onRegisterEventHandlers()
      that.onRegisterServices()
      that.onDxlConnect()
      if (callback) {
        callback()
      }
    })
  }
}

Application.prototype.onDxlConnect = function () {}
Application.prototype.onLoadConfiguration = function (config) {}
Application.prototype.onRegisterEventHandlers = function () {}
Application.prototype.onRegisterServices = function () {}
Application.prototype.onRun = function () {}

Application.prototype.registerServiceAsync = function (regInfo, callback) {
  this.dxlClient.registerServiceAsync(regInfo, callback)
}

Application.prototype.run = function (callback) {
  if (this._running) {
    throw new Error('The application is already running')
  }

  this._running = true
  this.onRun()

  this._loadConfiguration()
  this._dxlConnect(callback)
}

Application.prototype.destroy = function (callback) {
  if (this.dxlClient) {
    this.dxlClient.destroy(callback)
  }
}

module.exports = Application
