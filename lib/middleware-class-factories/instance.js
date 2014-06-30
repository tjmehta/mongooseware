var util = require('util');
var last = require('101/last');
var BaseMiddleware = require('../base-middleware');
var inflect = require('i')();
var reduceSteps = require('../reduce-steps');
var replacePlaceholders = require('../replace-placeholders');
var listInstanceMethods = require('../method-lists/list-instance-methods');
var queryMethods = require('../method-lists/query-methods');


module.exports = createInstanceMiddlewareClass;

function createInstanceMiddlewareClass (Model, key) {
  key = key || inflect.singularize(Model.modelName);

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
  InstanceMiddleware.prototype.exec = function (keyOverride) {
    var self = this;
    return function (req, res, next) {
      if (isSync(last(self.methodChain).method)) {
        self.sync(keyOverride)(req, res, next);
      }
      else {
        var result = reduceSteps(req, req[self.modelKey], self.methodChain);
        result.exec(function (err, data) {
          if (err) { return next(err); }

          req[keyOverride || self.modelKey] = data;
          next();
        });
      }
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