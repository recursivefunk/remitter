
'use strict';

require('dotenv').config({path: 'test/test.env'});

const test = require('tape');
const P = require('bluebird');
const co = require('co');
const check = require('check-types');
const Remitter = require('../index');

const setup = () => {
  return co(function*() {
    const remitter = Remitter();
    yield remitter.connect();
    return remitter;
  }).catch((err) => {
    console.error(err);
    process.exit();
  });
};

const cleanup = (remitter) => {
  const remitters = (check.array(remitter)) ? remitter : [remitter];
  remitters.forEach((r) => r.destroy());
};

test('it connects', (t) => {
  co(function*() {
    const remitter = yield setup();
    t.equal(remitter.isConnected(), true, 'clients are connected');
    cleanup(remitter);
    t.end();
  })
  .catch((err) => console.error(err));
});

test('it emits and listens', (t) => {
  co(function*() {
    const remitter = yield setup();
    const remitter2 = yield setup();

    remitter.on('object', (data) => {
      t.equal((typeof data), 'object', 'data is an object');
      t.ok(data.beep, 'the beep key exists');
      t.equal(data.beep, 'boop', 'the value for key beep is boop');
    });

    remitter.on('string', (data) => {
      t.equal((typeof data), 'string', 'data is a string');
      t.equal(data, 'bang', 'string is bang');
      cleanup([remitter, remitter2]);
      t.end();
    });

    remitter2.emit('object', { beep: 'boop' });
    remitter2.emit('string', 'bang');

  })
  .catch((err) => console.error(err));
});

test('removes a listener', (t) => {
  co(function*() {
    const remitter = yield setup();
    const remitter2 = yield setup();
    let count = 0;

    remitter2.on('inc', () => {
      count += 1;
    });

    remitter.emit('inc');
    remitter2.off('inc');
    remitter.emit('inc');

    setTimeout(() => {
      t.equal(count, 1, 'should have only listened to one inc event');
      cleanup([remitter, remitter2]);
      t.end();
    }, 500)

  })
  .catch((err) => console.error(err));
});
