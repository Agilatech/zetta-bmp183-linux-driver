/*
Copyright © 2016 Agilatech. All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const device = require('zetta-device');
const sensor = require('@agilatech/bmp183');
const util = require('util');

var bmp183 = module.exports = function(options) {
  device.call(this);

  this.options = options || {};
  this.spibus = this.options['bus'] || "/dev/spidev1.0";
  this.altitude = this.options['altitude'] || 0;
  this.mode = this.options['mode'] || 3;
  this.chronPeriod  = this.options['chronPeriod']  || 60000; //milliseconds
  this.streamPeriod = this.options['streamPeriod'] || 10000;

  this.pressure          = 0;
  this.temperature       = 0;
  this.pressureStream    = 0;
  this.temperatureStream = 0;
    
  this._chronInterval     = null;
  this._streamPressure    = null;
  this._streamTemperature = null;

  this.bmp183_sensor = new sensor.Bmp183(this.spibus, this.altitude, this.mode);
};

util.inherits(bmp183, device);

bmp183.prototype.init = function(config) {

  config
        .type('BMP183_Sensor')
        .state('chron-off')
        .when('chron-off', {allow: ['start-isochronal']})
        .when('chron-on', {allow: ['stop-isochronal']})
        .stream('pressureStream', this.streamPressure)
        .stream('temperatureStream', this.streamTemperature)
        .monitor('pressure')
        .monitor('temperature')
        .map('stop-isochronal', this.stopIsochronal)
        .map('start-isochronal', this.startIsochronal)
        .name(this.bmp183_sensor.deviceName())
        .remoteFetch(function() {
            return {
                active: this.bmp183_sensor.deviceActive(),
                pressure: this.readPressure(),
                temperature: this.readTemperature()
            };
        });
};

bmp183.prototype.startIsochronal = function(callback) {
    this.state = 'chron-on';
    
    // load values right away before the timer starts
    this.pressure = this.readPressure();
    this.temperature = this.readTemperature();
    
    var self = this;
    
    this._chronInterval = setInterval(function() {
      self.pressure = self.readPressure();
      self.temperature = self.readTemperature();
    }, this.chronPeriod);
    
    callback();
}

bmp183.prototype.stopIsochronal = function(callback) {
    this.state = 'chron-off';

    this.pressure = 0;
    this.temperature = 0;
    
    clearTimeout(this._chronInterval);
    callback();
};

bmp183.prototype.streamPressure = function(stream) {
    // a stream period of 0 disables streaming
    if (this.streamPeriod <= 0) { 
      stream.write(0);
      return;
    }

    var self = this;
    this._streamPressure = setInterval(function() {
        stream.write(self.readPressure());
    }, this.streamPeriod);
};

bmp183.prototype.streamTemperature = function(stream) {
    // a stream period of 0 disables streaming
    if (this.streamPeriod <= 0) {
        stream.write(0);
        return;
    }
    
    var self = this;
    this._streamTemperature = setInterval(function() {
        stream.write(self.readTemperature());
    }, this.streamPeriod);
};

bmp183.prototype.readPressure = function() {
    
    if (this.bmp183_sensor.deviceActive()) {
      return this.bmp183_sensor.valueAtIndexSync(0);
    }
};

bmp183.prototype.readTemperature = function() {
    
    if (this.bmp183_sensor.deviceActive()) {
        return this.bmp183_sensor.valueAtIndexSync(1);
    }
};

