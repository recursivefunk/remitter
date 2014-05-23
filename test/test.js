/*global describe:false, it:false, before: false*/

'use strict';

var should = require( 'should' );
var Remitter = require( '../index' );
var logger = require( 'luvely' );

describe('Remitter', function(){

  logger.info( 'Testing event propgation and datatype integrity for Remitter' );

  var rEmitter;

  before(function(done){
    rEmitter = new Remitter();
    rEmitter.connect( done );
  });

  it('works for an object', function(done){
    logger.info( 'Testing object integrity' );
    var theData = {
      foo: 'bar'
    };

    rEmitter
      .on('anObject', function(data){
        data.should.be.ok;
        data.should.eql( theData );
        var type = Object.prototype.toString.call( data );
        type.indexOf( 'Object' ).should.be.above( -1 );
        done();
      })
      .emit( 'anObject', theData );
  });

  it('works for a string', function(done){
    logger.info( 'Testing string integrity' );
    var theString = 'a string';

    rEmitter
      .on('aString', function(data){
        data.should.be.ok;
        data.should.eql( theString );
        var type = Object.prototype.toString.call( data );
        type.indexOf( 'String' ).should.be.above( -1 );
        done();
      })
      .emit( 'aString', theString );
  });

  it('works for an array', function(done){
    logger.info( 'Testing array integrity' );
    var theArray = [ 1, 2, 3 ];

    rEmitter
      .on('anArray', function(data){
        data.should.be.ok;
        data.should.eql( theArray );
        var type = Object.prototype.toString.call( data );
        type.indexOf( 'Array' ).should.be.above( -1 );
        done();
      })
      .emit( 'anArray', theArray );
  });

  it('works for a number', function(done){
    logger.info( 'Testing numerical integrity' );
    var theNumber = 10;

    rEmitter
      .on('aNumber', function(data){
        data.should.be.ok;
        data.should.eql( theNumber );
        var type = Object.prototype.toString.call( data );
        type.indexOf( 'Number' ).should.be.above( -1 );
        done();
      })
      .emit( 'aNumber', theNumber );
  });


});