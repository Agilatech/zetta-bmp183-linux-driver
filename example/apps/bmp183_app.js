/*
 Copyright © 2016 Agilatech. All Rights Reserved.
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

module.exports = function testApp(server) {
  
  var bmp183DeviceQuery = server.where({type:'BMP183_Sensor'});
  
  server.observe([bmp183DeviceQuery], function(bmp183Device){

  	// start the periodic data collection
  	bmp183Device.call('start-isochronal');

    // Note that there are effectively two different data streams.  One is the monitored data
    // value that is transmitted on the isochronal period defined by chronPeriod. At every
    // chronPeriod, the montored data values are sampled and trigger a data event.
    // The incomming message contains three fields: topic, timestamp, and data.
  	bmp183Device.streams.pressure.on('data', function(message) {
      console.log("Monitored data :  " + message.topic + " : " + message.timestamp + " : " + message.data)
    });
                 
    bmp183Device.streams.temperature.on('data', function(message) {
      console.log("Monitored data :  " + message.topic + " : " + message.timestamp + " : " + message.data)
    });

    // The other streams are periodic
    bmp183Device.streams.pressureStream.on('data', function(message) {
      server.info("Pressure data stream " + message.topic + " : " + message.timestamp + " : " + message.data);
    });

    bmp183Device.streams.temperatureStream.on('data', function(message) {
      server.info("Temperautre data stream " + message.topic + " : " + message.timestamp + " : " + message.data);
    });

  	// Above, note that we know the monitored and streaming data names.  This information is also available
  	// in the device meta response at http://localhost:1107/servers/testServer/meta/BMP183_Sensor
  });
  
}

