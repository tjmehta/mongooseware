/**
 * TODO: document
 * @module lib/middleware-class-factories/instance
 */
'use strict';

var last = require('101/last');
var util = require('util');

var BaseMiddleware = require('../base-middleware');
var listInstanceMethods = require('../method-lists/list-instance-methods');
var reduceSteps = require('../reduce-steps');

module.exports = createInstanceMiddlewareClass;

function createInstanceMiddlewareClass (Model, key) {
  function InstanceMiddleware () { // uses Model and key from closure
    return BaseMiddleware.call(this, Model, key);
  }
  util.inherits(InstanceMiddleware, BaseMiddleware);
  /***
   * Methods
   */
  listInstanceMethods(Model).forEach(function (method) {
    InstanceMiddleware.prototype[method] = function () {
      this.methodChain.push({
        method: method,
        args: Array.prototype.slice.call(arguments)
      });

      return this;
    };
  });
  /***
   * Extended Methods
   */
  InstanceMiddleware.prototype.exec = function (/* keys */) {
    var self = this;
    var origKeys = Array.prototype.slice.call(arguments);
    return function (req, res, next) {
      (function (req, res, next) {
        var keys = origKeys.slice(); // copy
        if (isSync(last(self.methodChain).method)) {
          self.sync(keys[0])(req, res, next);
        }
        else {
          var result = reduceSteps(req, req[self.modelKey], self.methodChain, callback);
          if (result && result.exec) {
            result.exec(callback);
          }
        }
        var nexted = false;
        function callback (err) {
          if (nexted) { return; } // prevents double nexting.
          nexted = true;
          if (err) {
            next(err);
          }
          else {
            var datas = Array.prototype.slice.call(arguments, 1);
            keys[0] = keys[0] || self.modelKey;
            keys.forEach(function (key, i) {
              req[key] = datas[i];
            });
            next();
          }
        }
      })(req, res, next);
    };
  };
  InstanceMiddleware.prototype.sync = function (keyOverride) {
    var self = this;
    return function (req, res, next) {
      var result;
      try {
        result = reduceSteps(req, req[self.modelKey], self.methodChain);
      }
      catch (err) {
        return next(err);
      }
      finally {
        req[keyOverride || self.modelKey] = result;
        next();
      }
    };
  };

  return InstanceMiddleware;
}

var syncMethods = ['set', 'unset', 'get', 'toJSON'];
function isSync (methodName) {
  return ~syncMethods.indexOf(methodName);
}
