### Description
Good ol' fashion event emitting/listening but using redis instead of node's native event emitter.

### Get Deps
Redis needs to be running somewhere

### Install
```
  npm install remitter --save
```

### Usage
```javascript
  var Remitter = require( 'remitter' );
  var thing = new Remitter({
    host: '127.0.0.1', // this is default
    port: 6379, // this is default
    password: 'fflks48ow'
  });

  thing.connect( onReady );

  function onReady() {
    thing.on('anEvent', function(someData){
      // you know the deal
    });

    // .... some time later

    thing.emit( 'anEvent', { aMessage: 'sup' } );
  }
```

### Test
```
  npm test
```




