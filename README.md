### Description
Good ol' fashion event emitting/listening but using redis instead of node's native event emitter.

### Install
```
  npm install remitter --save
```

### Usage
```javascript
  var Remitter = require( 'remitter' );
  var thing = new Remitter(); // accept all redis defaults

  thing.on('anEvent', function(someData){
    // you know the deal
  });

  // .... some time later

  thing.emit( 'anEvent', { aMessage: 'sup' } );
```




