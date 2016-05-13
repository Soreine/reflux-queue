var Q = require('q');

/**
 * Has its own queue and can queue actions on it.
 */
var RefluxQueue = function () {
    // Holds a queue of { fn, args, deferred }
    this.queue = [];
};

/**
 * @param {Function} fn Function to make queued
 * @return {Function} The same function, but queued. If `fn` did not
 * returned a promise, this one will.
 */
RefluxQueue.prototype.queuedFunc = function (fn) {
    var queue = this.queue;
    return function() {
        // Start dequeuing on the first function call
        var willDequeue = queue.length == 0;

        var d = Q.defer();
        var args = Array.prototype.slice.call(arguments);
        queue.push({
            fn: fn,
            args: args,
            deferred: d
        });

        if (willDequeue) {
            dequeue(queue);
        }

        return d.promise;
    };
};

function dequeue(queue) {
    if (queue.length === 0) return;
    var first = queue[0];

    // Wrap the call in a promise
    Q()
    .then(function () {
        return first.fn.apply(null, first.args);
    })
    // Unwrap result into the deferred
    .then(function(result) {
        first.deferred.resolve(result);
    }, function(err) {
        first.deferred.reject(err);
    })
    // Move on next one
    .fin(function() {
        queue.shift();
        dequeue(queue);
    });
}

module.exports = RefluxQueue;
