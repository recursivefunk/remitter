
'use strict';

const redis = require('redis');
const async = require('async');
const P = require('bluebird');
const component = require('stampit');
const emitterProto = require('events').EventEmitter.prototype;

module.exports = (redisUrl) => {
  redisUrl = redisUrl || process.env.REDIS_URL;
  return component()
    .methods({

      isConnected() {
        return this._subClient.connected && this._pubClient.connected;
      },

      connect() {
        const resolver = P.pending();
        const self = this;

          this._subClient = redis.createClient(redisUrl);
          this._pubClient = redis.createClient(redisUrl);

          const getPubReady = (cb) => {
            self._pubClient.on('ready', cb);
          };

          const getSubReady = (cb) => {
            self._subClient.on('ready', cb);
          };

          async.parallel([ getPubReady, getSubReady ], (err) => {
            if (err) {
              resolver.reject(err);
            } else {
              if (self._password) {
                self._pubClient.auth(self._password);
                self._subClient.auth(self._password);
              }
              resolver.resolve();
            }

          });

        return resolver.promise;
      },

      on(evt, onEvt) {
        const self = this;
        this._subClient.subscribe(evt);
        this._subClient.on('message', (channel, data) => {
          if (channel === evt) {
            if (data) {
              const obj = self._deserialize(data);
              onEvt(obj);
            } else {
              onEvt();
            }
          }
        });
        return this;
      },

      emit(evt, data) {
        let serializedData = this._serialize(data);
        serializedData = (serializedData) ? serializedData : '';
        this._pubClient.publish(evt, serializedData);
        return this;
      },

      removeListener(evt) {
        this._subClient.unsubscribe(evt);
        return this;
      },

      off(evt) {
        return this.removeListener(evt);
      },

      destroy() {
        this._subClient.end(true);
        this._subClient.unref();
        this._pubClient.end(true);
        this._pubClient.unref();
        return this;
      },

      _serialize(data) {
        data = data || '';
        const type = Object.prototype.toString.call(data);
        if (type.indexOf('Array') > -1 || type === '[object Object]') {
          return JSON.stringify(data);
        }
        return data.toString();
      },

      _deserialize(data) {
        let obj;
        try {
          obj = JSON.parse(data);
        } catch (e) {
          obj = data;
        }
        return obj;
      }
    })
    .refs({
      _subscriptions: {},
      _subClient: {},
      _pubClient: {}
    })
    .create();
}
