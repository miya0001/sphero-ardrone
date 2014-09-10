var Cylon = require('cylon');
var fly = false;
var calibrated = false;

Cylon.robot({
  connection: [
    { name: 'sphero', adaptor: 'sphero', port: '/dev/cu.Sphero-PRO-AMP-SPP' },
    { name: 'ardrone', adaptor: 'ardrone', port: '192.168.1.1' }
  ],
  device: [
    { name: 'sphero', driver: 'sphero' },
    { name: 'drone', driver: 'ardrone', connection: 'ardrone' }
  ],

  work: function(my) {

    after((1).seconds(), function() {
      console.log("Setting up Collision Detection...");
      my.sphero.detectCollisions();
      // To detect locator, accelOne and velocity from the sphero
      // we use setDataStreaming.
      // sphero API data sources for locator info are as follows:
      // ['locator', 'accelOne', 'velocity']
      // It is also possible to pass an opts object to setDataStreaming():
      var opts = {
        // n: int, divisor of the max sampling rate, 400 hz/s
        // n = 40 means 400/40 = 10 data samples per second,
        // n = 200 means 400/200 = 2 data samples per second
        n: 100,
        // m: int, number of data packets buffered before passing them to the stream
        // m = 10 means each time you get data it will contain 10 data packets
        // m = 1 is usually best for real time data readings.
        m: 1,
        // pcnt: 1 -255, how many packets to send.
        // pcnt = 0 means unlimited data Streaming
        // pcnt = 10 means stop after 10 data packets
        pcnt: 0,
      };
      my.sphero.setDataStreaming(['locator'], opts);

      my.sphero.configureLocator(1, 0, 0, 0);
      my.sphero.startCalibration();
      my.sphero.stop();
    });

    my.sphero.on('data', function(data) {
      if (!calibrated) {
          return;
      }
      console.log(data[0]);
      if (data[0] < 0) {
        if (!fly) {
          my.drone.takeoff();
          fly = true;
        }
      } else {
        if (fly) {
          my.drone.land();
          fly = false;
        }
      }
    });

    my.sphero.on('collision', function(data) {
      my.sphero.finishCalibration();
      calibrated = true;
    });

  }
}).start();
