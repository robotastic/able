var events = require('events');
var util = require('util');
var Able = require('./lib/able');
var ANCS = require('./ancs');
var events = require('events');
var AblePrimaryService = require('./lib/primary-service.js');
var GenericCharacteristic = require('./generic-characteristic');
var Notification = require('./ancs-notification');


var SERVICE_UUID                = '7905f431b5ce4e99a40f4b1e122d00d0';

var NOTIFICATION_SOURCE_UUID    = '9fbf120d630142d98c5825e699a21dbd';
var CONTROL_POINT_UUID          = '69d1d8f345e149a898219bbdfdaad9d9';
var DATA_SOURCE_UUID            = '22eac6e924d64bb5be44b36ace7c7bfb';


var able = new Able();

var ANCS = function(peripheral) {
  this._peripheral = peripheral;
  this._characteristics = {};
  this._notifications = {};

  this._lastUid = null;

  this.uuid = peripheral.uuid;

  this._peripheral.on('disconnect', this.onDisconnect.bind(this));
};
util.inherits(ANCS, events.EventEmitter);

ANCS.prototype.onDisconnect = function() {
  this.emit('disconnect');
};

ANCS.prototype.connect = function(callback) {
  this._peripheral.connect(callback);
};

ANCS.prototype.disconnect = function(callback) {
  this._peripheral.disconnect(callback);
};

ANCS.prototype.discoverServicesAndCharacteristics = function(callback) {
  console.log('CHARECTERISTIC');
  this._peripheral.findServiceAndCharacteristics(SERVICE_UUID, [], function(error, services, characteristics) {
    for (var i in characteristics) {
/*      console.log("CHARECTERISTIC: "+characteristics[i]);
      if (characteristics[i].uuid == NOTIFICATION_SOURCE_UUID) {
        console.log("NOTIFICATION_SOURCE_UUID");
      }
     if (characteristics[i].uuid == DATA_SOURCE_UUID) {
        console.log("DATA_SOURCE_UUID");
      }*/
      this._characteristics[characteristics[i].uuid] = characteristics[i];
    }

    this._characteristics[NOTIFICATION_SOURCE_UUID].on('read', this.onNotification.bind(this));
    this._characteristics[DATA_SOURCE_UUID].on('read', this.onData.bind(this));

    ancs._characteristics[NOTIFICATION_SOURCE_UUID].notify(true);
    ancs._characteristics[DATA_SOURCE_UUID].notify(true);
    
    callback();
  }.bind(this));
};

ANCS.prototype.onNotification = function(data) {
  var notification = new Notification(this, data);

  this._notifications[notification.uid] = notification;
  notification.readTitle(function(title){
    console.log("title: " + title);
  })
  notification.readMessage(function(message){
    console.log("Message: " + message);
  })
  this.emit('notification', data);
};

ANCS.prototype.onData = function(data) {
  var commandId = data.readUInt8(0);

  if (commandId === 0x00) {
    var uid = data.readUInt32LE(1);
    var notificationData = data.slice(5);

    this._lastUid = uid;

    this._notifications[uid].emit('data', notificationData);
  } else {
    if (this._lastUid) {
      this._notifications[this._lastUid].emit('data',data);
    }
  }
};

ANCS.prototype.requestNotificationAttribute = function(uid, attributeId, maxLength) {
  var buffer = new Buffer(maxLength ? 8 : 6);

  buffer.writeUInt8(0x00, 0);
  buffer.writeUInt32LE(uid, 1);
  buffer.writeUInt8(attributeId, 5);
  if (maxLength) {
    buffer.writeUInt16LE(maxLength, 6);
  }

  this._characteristics[CONTROL_POINT_UUID].write(buffer, false);
};


able.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    if (able.startAdvertisingWithEIRData) {
      var ad = new Buffer([
        // flags
        0x02, 0x01, 0x02,

        // ANCS solicitation
        0x11, 0x15, 0xd0, 0x00, 0x2D, 0x12, 0x1E, 0x4B, 0x0F,
        0xA4, 0x99, 0x4E, 0xCE, 0xB5, 0x31, 0xF4, 0x05, 0x79
      ]);

    /* var ad = new Buffer([
        // flags
        0x02, 0x01, 0x05,

        //device name
        0x0a, 0x09, 0x41, 0x4e, 0x42, 0x52, 0x21, 0x54, 0x75, 0x73, 0x6b,

        // Appearence
        0x03, 0x19, 0x40, 0x02

        ]);
*/
      var scan = new Buffer([0x05, 0x08, 0x74, 0x65, 0x73, 0x74]); // name
      /*var scan = new Buffer([0x11, 0x15, 0xd0, 0x00, 0x2D, 0x12, 0x1E, 0x4B, 0x0F,
        0xA4, 0x99, 0x4E, 0xCE, 0xB5, 0x31, 0xF4, 0x05, 0x79]);*/
      able.startAdvertisingWithEIRData(ad, scan);
    } else {
      able.startAdvertising('ancs-test', ['7905f431b5ce4e99a40f4b1e122d00d0']);
    }

  } else {
    able.stopAdvertising();
  }
});
var target_uuid;
  var ancs

able.on('accept', function(peripheral) {

   console.log('on -> accept: ' );
  ancs = new ANCS(peripheral);

    ancs.on('notification', function(notification) {
      console.log('ancs - notification: ' + notification);

    });

ancs.on('disconnect', function() {
      console.log('ancs - disconnected');
       able.connect(target_uuid);
});




  target_uuid = peripheral.id;

});

able.on('advertisingStart', function(error) {

  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));


    able.setServices(  [    new AblePrimaryService({
        uuid: '13333333333333333333333333333337',            //'7905f431b5ce4e99a40f4b1e122d00d0',
        characteristics: [new GenericCharacteristic()]
      })
    ]);
  
});

able.on('mtuChange', function() {

});


able.on('encryptChange', function() {
  console.log("able encryptChange!!!");
      ancs.discoverServicesAndCharacteristics(function() {

        var handle = able._bindings._handles[ancs.uuid];
         var aclStream = able._bindings._aclStreams[handle];


         aclStream.on('encryptFail', function() {
      console.log('ancs - services and characteristics failed'); 
      });

    });


});


able.on('encryptFail', function() {
  console.log("able encryptFail");

});

able.on('connect', function() {
    console.log('NOBLE on -> connect');

});

able.on('disconnect', function() {
      console.log('Got a disconnect');
  able.connect(target_uuid);
});


