'use strict'

/* eslint no-unused-expressions: "off" */ // for chai expect assertions

var expect = require('chai').expect
var dxl = require('@opendxl/dxl-client')
var Request = dxl.Request
var Response = dxl.Response
var ServiceRegistrationInfo = dxl.ServiceRegistrationInfo
var uuidv4 = require('uuid/v4')
var MessageUtils = require('../..').MessageUtils
var TestApplication = require('./test-application')

describe('Application @integration', function () {
  it('should invoke onRun after run is called', function (done) {
    var app = new TestApplication('', this, done)
    var running = false
    app.onRun = function () { running = true }
    app.run(function () {
      app.shutdown(null, function () {
        expect(running).to.be.true
        done()
      })
    })
  })

  it('should connect the client before onDxlConnect is called',
    function (done) {
      var app = new TestApplication('', this, done)
      var connected = false
      app.onDxlConnect = function () { connected = this._dxlClient.connected }
      app.run(function () {
        app.shutdown(null, function () {
          expect(connected).to.be.true
          done()
        })
      })
    }
  )

  it('should load the service configuration', function (done) {
    var app = new TestApplication(
      '[Section1]\nbooleanSetting=false\nstringSetting1=astring\n' +
      '[Section2]\nstringSetting2=bstring', this, done)
    var serviceConfig
    app.onLoadConfiguration = function (config) {
      serviceConfig = config
    }
    app.run(function () {
      app.shutdown(null, function () {
        expect(serviceConfig).to.eql({
          Section1: {
            booleanSetting: false,
            stringSetting1: 'astring'
          },
          Section2: {
            stringSetting2: 'bstring'
          }
        })
        done()
      })
    })
  })

  it('should register an event handler with the broker', function (done) {
    var topic = 'app_test_event_' + uuidv4()
    var app = new TestApplication('[General]\neventPayload=event ping', this,
      done)

    app.onLoadConfiguration = function (config) {
      this._eventPayload = config.General.eventPayload
    }
    app.onRegisterEventHandlers = function () {
      var that = this
      var client = this._dxlClient

      client.addEventCallback(topic, function (event) {
        that.shutdown(null, function () {
          expect(MessageUtils.decodePayload(event)).to.equal('event ping')
          done()
        })
      })
    }

    app.run(function () {
      var event = new dxl.Event(topic)
      event.payload = app._eventPayload
      app._dxlClient.sendEvent(event)
    })
  })

  it('should register a service with the broker', function (done) {
    var topic = 'app_test_service_' + uuidv4()
    var app = new TestApplication('[General]\nrequestPayload=ping', this, done)

    app.onLoadConfiguration = function (config) {
      this._requestPayload = config.General.requestPayload
    }
    app.onRegisterServices = function () {
      var that = this
      var client = this._dxlClient
      var regInfo = new ServiceRegistrationInfo(client, 'app_test_service')

      regInfo.addTopic(topic, function (request) {
        var response
        response = new Response(request)
        response.payload = 'Echo: ' + request.payload
        that._dxlClient.sendResponse(response)
      })
      app.registerServiceAsync(regInfo)
    }

    app.run(function () {
      var request = new Request(topic)
      request.payload = app._requestPayload
      app._dxlClient.asyncRequest(request, function (error, response) {
        app.shutdown(error, function () {
          expect(MessageUtils.decodePayload(response)).to.equal('Echo: ping')
          done()
        })
      })
    })
  })
})
