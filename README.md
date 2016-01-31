
# Remitter

[![Build Status](https://travis-ci.org/recursivefunk/remitter.svg?branch=master)](https://travis-ci.org/recursivefunk/remitter)

### Description
Redis is awesome. But have you seen how one accomplishes [pub/sub](https://github.com/mranney/node_redis#publish--subscribe) with the (otherwise incredibly awesome) redis module? Good ol' fashion event emitting/listening but using redis instead of node's native event emitter.

### Redis
You need a redis instance. Configure it in your environment (replace host and port with your instance info)
```
$ export REDIS_URL=redis://127.0.0.1:6379/
```

### Install
```
$ npm install remitter --save
```

### Usage
```javascript
  const Remitter = require('remitter');
  const thing = Remitter(process.env.REDIS_URL);

  thing
    .connect()
    .then(() => {
      thing.on('foo', (foo) => {
        console.log('foo'); // { beep: 'boop' }
      });
    });

    // .... elsewhere in your app - maybe even another process!
    const thing2 = Remitter(process.env.REDIS_URL);
    thing2
      .connect()
      .then(() => {
        thing2.emit('foo', { beep: 'boop' });
      });
  

  // ...some time later
  thing.destroy();
  thing1.destroy();
```

### Test
```
$ echo "REDIS_URL=redis://127.0.0.1:6379/" >> test/test.env
$ npm test
```




