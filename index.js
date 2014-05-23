
'use strict';

var redis = require( 'redis' );
var logger = require( 'luvely' );

var Remitter = function( opts ) {
  var self = this;
  opts = opts || {};
  this._host = opts.host || 'localhost';
  this._port = opts.port || 6379;
  this._auth = opts.auth;
  this._subClient = redis.createClient();
  this._pubClient = redis.createClient();
  return this;
};

// Remitter.prototype.connect = function( callback ) {
//   var self = this;
// };

Remitter.prototype.on = function( evt, onEvt ) {
  var self = this;
  this._subClient.subscribe( evt );
  this._subClient.on('message', function( channel, data ){

    if ( data ) {
      var obj = self._deserialize( data );
      onEvt( obj );
    } else {
      onEvt();
    }
  });
  return this;
};

Remitter.prototype.emit = function( evt, data ) {
  var serializedData = this._serialize( data );
  serializedData = ( serializedData ) ? serializedData : '';
  this._pubClient.publish( evt, serializedData );
  return this;
};

Remitter.prototype._serialize = function( data ) {
  var type = Object.prototype.toString.call( data );
  if ( type.indexOf( 'Array') > -1 || type === '[object Object]' ) {
    return JSON.stringify( data );
  }
  return data.toString();
};

Remitter.prototype._deserialize = function( data ) {
  var obj;
  try {
    obj = JSON.parse( data );
  } catch ( e ) {
    obj = data;
  }
  return obj;
};

module.exports = Remitter;