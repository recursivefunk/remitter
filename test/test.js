/*global describe:false, it:false, before: false*/

'use strict';

var should = require( 'should' );
var Remitter = require( '../index' );

describe('Remitter', function(){

  var rEmitter;

  before(function(done){
    rEmitter = new Remitter();
    rEmitter.connect( done );
  });

  it('works', function(done){

    var theData = {
      foo: 'bar'
    };

    rEmitter

      .on('anEvent', function(data){
        data.should.be.ok;
        data.should.eql( theData );
        done();
      })

      .emit( 'anEvent', theData );
  });


});