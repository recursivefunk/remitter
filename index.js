
'use strict';

var redis         = require( 'redis' );
var logger        = require( 'luvely' );
var async         = require( 'async' );
var util          = require( 'util' );
var EventEmitter  = require( 'events' ).EventEmitter;

var Remitter = function( opts ) {
  var self = this;
  opts = opts || {};
  this._host = opts.host || '127.0.0.1';
  this._port = opts.port || 6379;
  this._password = opts.password;
  this._subClient = opts.sub || null;
  this._pubClient = opts.pub || null;
  this._subscriptions = {};
  return this;
};

util.inherits( Remitter, EventEmitter );

Remitter.prototype.connect = function( callback ) {
  var self = this;

  this._subClient = redis.createClient( this._port, this._host );
  this._pubClient = redis.createClient( this._port, this._host );

  var getPubReady = function( cb ) {
    self._pubClient.on( 'ready', cb );
  };

  var getSubReady = function( cb ) {
    self._subClient.on( 'ready', cb );
  };

  async.parallel( [ getPubReady, getSubReady ], function(){
    if ( self._password ) {
      self._pubClient.auth( self._password );
      self._subClient.auth( self._password );
    }
    callback();
  });
};

Remitter.prototype.on = function( evt, onEvt ) {
  var self = this;
  this._subClient.subscribe( evt );
  this._subClient.on('message', function( channel, data ){
    if ( channel === evt ) {
      if ( data ) {
        var obj = self._deserialize( data );
        onEvt( obj );
      } else {
        onEvt();
      }
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

Remitter.prototype.removeListener = function( evt ) {
  this._subClient.unsubscribe( evt );
  return this;
};

Remitter.prototype._serialize = function( data ) {
  data = data || '';
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
