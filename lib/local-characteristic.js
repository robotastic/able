var events = require('events');
var util = require('util');

var debug = require('debug')('characteristic');

var UuidUtil = require('./uuid-util');

function LocalCharacteristic(options) {
  this.uuid = UuidUtil.removeDashes(options.uuid);
  this.properties = options.properties || [];
  this.secure = options.secure || [];
  this.value = options.value || null;
  this.descriptors = options.descriptors || [];

  if (options.onReadRequest) {
    this.onReadRequest = options.onReadRequest;
  }

  if (options.onWriteRequest) {
    this.onWriteRequest = options.onWriteRequest;
  }

  if (options.onSubscribe) {
    this.onSubscribe = options.onSubscribe;
  }

  if (options.onUnsubscribe) {
    this.onUnsubscribe = options.onUnsubscribe;
  }

  if (options.onNotify) {
    this.onNotify = options.onNotify;
  }

  if (options.onIndicate) {
    this.onIndicate = options.onIndicate;
  }

  this.on('readRequest', this.onReadRequest.bind(this));
  this.on('writeRequest', this.onWriteRequest.bind(this));
  this.on('subscribe', this.onSubscribe.bind(this));
  this.on('unsubscribe', this.onUnsubscribe.bind(this));
  this.on('notify', this.onNotify.bind(this));
  this.on('indicate', this.onIndicate.bind(this));
}

util.inherits(LocalCharacteristic, events.EventEmitter);

LocalCharacteristic.RESULT_SUCCESS                  = LocalCharacteristic.prototype.RESULT_SUCCESS                  = 0x00;
LocalCharacteristic.RESULT_INVALID_OFFSET           = LocalCharacteristic.prototype.RESULT_INVALID_OFFSET           = 0x07;
LocalCharacteristic.RESULT_ATTR_NOT_LONG            = LocalCharacteristic.prototype.RESULT_ATTR_NOT_LONG            = 0x0b;
LocalCharacteristic.RESULT_INVALID_ATTRIBUTE_LENGTH = LocalCharacteristic.prototype.RESULT_INVALID_ATTRIBUTE_LENGTH = 0x0d;
LocalCharacteristic.RESULT_UNLIKELY_ERROR           = LocalCharacteristic.prototype.RESULT_UNLIKELY_ERROR           = 0x0e;

LocalCharacteristic.prototype.toString = function() {
  return JSON.stringify({
    uuid: this.uuid,
    properties: this.properties,
    secure: this.secure,
    value: this.value,
    descriptors: this.descriptors
  });
};

LocalCharacteristic.prototype.onReadRequest = function(offset, callback) {
  callback(this.RESULT_UNLIKELY_ERROR, null);
};

LocalCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
  callback(this.RESULT_UNLIKELY_ERROR);
};

LocalCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  this.maxValueSize = maxValueSize;
  this.updateValueCallback = updateValueCallback;
};

LocalCharacteristic.prototype.onUnsubscribe = function() {
  this.maxValueSize = null;
  this.updateValueCallback = null;
};

LocalCharacteristic.prototype.onNotify = function() {
};

LocalCharacteristic.prototype.onIndicate = function() {
};

module.exports = LocalCharacteristic;
