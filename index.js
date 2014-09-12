var Cylon = require('cylon');
var fly = false;
var flip = false;
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
      var opts = {
        n: 100,
        m: 1,
        pcnt: 0,
      };
      my.sphero.setDataStreaming(['imu'], opts);
      my.sphero.startCalibration();
      my.sphero.stop();
    });

    my.sphero.on('data', function(data) {
      if (!fly == true) {
        return;
      }

      if (50 > data[2]) {
        console.log('clockwise');
        my.drone.clockwise(1);
      } else if (150 < data[2]) {
        console.log('counterclockwise');
        my.drone.counterClockwise(1);
      } else if (-50 > data[0]) {
        console.log('front');
        my.drone.front(0.5);
      } else if (50 < data[0]) {
        console.log('back');
        my.drone.back(0.5);
      } else if (-50 > data[1]) {
        console.log('left');
        my.drone.left(0.5);
      } else if (50 < data[1]) {
        console.log('right');
        my.drone.right(0.5);
      } else {
        console.log('stop');
        my.drone.stop();      }
    });

    my.sphero.on('collision', function(data) {
        if (fly) {
          console.log('Landing ...');
          my.drone.land();
          fly = false;
        } else {
          console.log('Take Off ...');
          my.drone.takeoff();
          fly = true;
        }
    });

  }
}).start();
