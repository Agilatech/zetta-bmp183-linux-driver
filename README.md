##Zetta bmp183 sensor driver for Linux

This driver should work on any Linux platform, and has been thoroughly tested on BeagleBone Black

###Install
```
$> npm install @agilatech/zetta-bmp183-linux-driver
```
OR
```
$> git clone https://github.com/Agilatech/zetta-bmp183-linux-driver zetta-bmp183-linux-driver
```
###Usage

```
var zetta = require('zetta');
var bmp183 = require('@agilatech/zetta-bmp183-linux-driver');

zetta()
.use(bmp183, [options])  // where [options] define operational paramters -- omit to accept defaults
.listen(<port number>)   // where <port number> is the port on which the zetta server should listen
```

####[options]
These options are defined in a file named 'options.json' which may be overridden by program definitions

```
"file":"<serial file device>"
/dev/ttyS0, /dev/ttyO2, etc...  Defaults to /dev/ttyS0

"chronPeriod":<period>
Period in milliseconds for monitored isochronal data

"streamPeriod":<period>
Period in milliseconds for streaming data. A value of 0 disables streaming.
```

####&lt;port number&gt;
Agilatech has definied the open port number 1107 as its standard default for IIOT (Industrial Internet 
Of Things) server application. In practice, most any port above 1024 may be used by other organizations.


###Example
Using directly in the zetta server:
```
const zetta = require('zetta');
const sensor = require('@agilatech/zetta-bmp183-linux-driver');
zetta().use(sensor).listen(1337);
```
Initializes the bmp183 driver on serial device /dev/ttyS0 with a data monitoring period of 60 seconds and streaming data every second

To override the options defined in the options.json file, supply them in an object in the use statement like this:
```
zetta().use(sensor, { "file":"/dev/ttyS2", "chronPeriod":30000, "streamPeriod":15000 });
```
Overrides the defaults to initialize the serial device on **/dev/ttyS2** with a data monitoring period of **30 seconds** and streaming data every **1.5 seconds**


###Properties
All drivers contain the following 5 core properties:
1. **state** : the current state of the device, containing either the value *chron-on* or *chron-off* 
to indicate whether the device is monitoring data isochronally (a predefinied uniform time period of device data query).
2. **active** : a boolean value indicating whether of not the underlying hardware is operational and active.
3. **id** : the unique id for this device.  This device id is used to subscribe to this device streams.
4. **name** : the given name for this device.
5. **type** : the given type for this device, usually containing the category of either *Sensor* or *Actuator*.


####Monitored Properties
In the *chron-on* state and *active* operation, the driver software for this device monitors pressure and temperature values in isochronal fashion with a period defined by *chronPeriod*:
1. **pressure** - Barometric pressure in hPa
2. **temperature** - Tempereature in °C range from -50°C to +55°C


####Streaming Properties
If the hardware is *active*, the driver software continuously streams pressure and temperature values with a frequency defined by *streamPeriod*. Note that a *streamPeriod* of 0 disables streaming.
1. **pressureStream**
1. **temperatureStream**


###State
**chron-off** is the beginning state.  The driver also enters this state after a transition '*stop-isochronal*' command.  
In this state, all monitored data values are set to 0, and no sensor readings are updated.

**chron-on** is the state after a transition '*start-isochronal*' command.  In this state, all monitored data values are 
updated every time period as specified by '*chronPeriod*'.

###Transitions
1. **start-isochronal** : Sets the device state to *chron-on* and begins the periodic collection of sensor data. 
Property values are monitored, with a period defined by the 'chronPeriod' option (defaults to 60 sec).
2. **stop-isochronal** : Sets the device state to *chron-off* and stops data collection for the monitored values.


###Design
This driver is specific to the BMP183 pressure and temperature sensor manufactured by Bosch. It will output both 
pressure in hPa (hectopascal, equal to millibar), and temperature in °C.  The measured pressure range is from 
300hPa to 1100hPa, while the measured temperature range is from -50°C to +55°C.

Atmospheric pressure is directly related to elevation (altitude), so this software compensates for elevation and 
reports the result as if the sensor were at sea level. This removes the effect of elevation on the reported pressure.
For this reason it is very important to specify the station elevation in the addon constructor.

It is expected that this sensor will be used on the surface of the earth, subjected to the normal variations of
pressure caused by weather and air movements.  As such, any pressure results outside the extreme record variations
encounted on the planet will be discarded as anomalies (1090 mbar < p < 850 mbar).  An anomalous reading is returned
as "none".  Note that failure to supply a valid elevation may result in an anomalous reading, thereby returning
"none" even when the sensor and driver are working properly.

####Operational Mode
There are 4 different modes of operation, offering tradeoffs between power usage and accuracy. The driver defaults 
to the highest resolution, but this can be altered by specifying a different integer value as the 3rd constructor 
argument.  See the Bosch datasheet for full explanation.
* 0 - Ultra Low Power Mode
* 1 - Standard Mode
* 2 - High Resolution Mode
* 3 - Ultra High Resolution Mode


### Hardware

* Beaglebone Black
* Beaglebone Green
* Should also work on Raspberry Pi as well as other Linux SBC


###Copyright
Copyright © 2016 Agilatech. All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
