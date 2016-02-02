
'use strict';

const redis = require('redis');
const async = require('async');
const P = require('bluebird');
const component = require('stampit');
const EventEmitter = require('events').EventEmitter;
const emitterProto = EventEmitter.prototype;

module.exports = (redisUrl) => {
  redisUrl = redisUrl || process.env.REDIS_URL;
  return component()
    .methods({

      /**
       * Determines whether or not the current is able to subscribe and emit
       *
       * @return {Boolean}
       */
      isConnected() {
        return this._subClient.connected && this._pubClient.connected;
      },

      /**
       * Creates a publishing client and subscribing client and waits for both
       * of them to emit the 'ready' event.
       *
       * @return {[type]} [description]
       */
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

      /**
       * Initializes a redis subscription for the specified event. All messages
       * come through the subscription object, but only the ones with the correct
       * channel will invoke the callback
       *
       * @param  {String} evt The event
       * @param  {Function} onEvt The callback function to be invoked in response to the specified event
       * @return {this}
       */
      on(evt, onEvt) {
        const self = this;
        this._subscriptions[evt] = true;
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

      /**
       * Emits the specified event and optional data by issuing a publish command
       * to redis.
       *
       * @param  {String} evt The event
       * @param  {data} data The data to be sent to all listeners
       * @return {this}
       */
      emit(evt, data) {
        let serializedData = this._serialize(data);
        serializedData = (serializedData) ? serializedData : '';
        this._pubClient.publish(evt, serializedData);
        return this;
      },

      /**
       * Unsubscribes from from the specified event
       *
       * @param  {String} evt The event
       * @return {this}
       */
      removeListener(evt) {
        this._subClient.unsubscribe(evt);
        delete this._subscriptions[evt];
        return this;
      },

      /**
       * An alias for removeListener()
       *
       * @param  {String} evt The event
       * @return {this}
       */
      off(evt) {
        return this.removeListener(evt);
      },

      /**
       * Destroys the subscription client and publishing client to free up resources
       *
       * @param  {int} delay The (optional) amount of time (in milliseconds) to wait before destroying the clients
       * @return {this}
       */
      destroy(delay) {
        const self = this;
        if (delay > -1) {
          setTimeout(doDestroy, delay);
        } else {
          doDestroy();
        }
        function doDestroy() {
          self._subClient.end(true);
          self._subClient.unref();
          self._pubClient.end(true);
          self._pubClient.unref();
        }
        return this;
      },

      /**
       * Gets data ready to be sent through redis. Objects get transformed to strings
       * and strings just passthrough
       *
       * @param  {Object|String} data The data be serialized
       * @return {String} serialized The data in serialized format
       */
      _serialize(data) {
        data = data || '';
        const type = Object.prototype.toString.call(data);
        if (type.indexOf('Array') > -1 || type === '[object Object]') {
          return JSON.stringify(data);
        }
        return data.toString();
      },

      /**
       * Transforms data into the format the consumer expects. Strings remain strings
       * and JSON gets parsed into objects
       *
       * @param  {String} data The string to be deserialized
       * @return {String|Object} deserialized The data in it's original form
       */
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
