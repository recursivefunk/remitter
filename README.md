### Description
Redis is awesome. But have you seen how one accomplishes [pub/sub](https://github.com/mranney/node_redis#publish--subscribe) with the (otherwise incredibly awesome) redis module? Good ol' fashion event emitting/listening but using redis instead of node's native event emitter.

### Get Deps
Redis needs to be running somewhere. Tests need mocha installed.

### Install
```
  npm install remitter --save
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
  }
```

### Test
```
  npm test
```




