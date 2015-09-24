var util = require('util');

var able = require('./lib/able');
var AblePrimaryService = able.PrimaryService;

//var Blink1RGBCharacteristic = require('./blink1-rgb-characteristic');
//var Blink1FadeRGBCharacteristic = require('./blink1-fade-rgb-characteristic');

function AncsService(blink1) {
  AncsService.super_.call(this, {
    uuid: '7905f431b5ce4e99a40f4b1e122d00d0',
    characteristics: []
  });
}

util.inherits(AncsService, AblePrimaryService);

module.exports = AncsService;
