var Q = require('q');
var RefluxQueue = require('./');

var refluxQueue = new RefluxQueue();

var a = refluxQueue.queuedFunc(function() {
    console.log('a called now');

    return Q().delay(100)
    .then(function() {
        console.log('a is first');
    });
});

var b = refluxQueue.queuedFunc(function(n, m) {
    console.log('b called now');

    return Q().delay(300)
    .then(function() {
        console.log('b is second', n, m);
    });
});

a()
.fail(console.log);

b('With a few', 'arguments')
.fail(console.log);

a()
.then(function() {
    b('With a few', 'arguments');
})
.fail(console.log);
