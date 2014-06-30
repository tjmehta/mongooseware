var util = require('util');
var BaseMiddleware = require('../base-middleware');
var inflect = require('i')();
var reduceSteps = require('../reduce-steps');
var replacePlaceholders = require('../replace-placeholders');

module.exports = createModelMiddlewareClass;

function createModelMiddlewareClass (Model, key) {
  // these requires must be within function call else circular dependency issue
  var listClassMethods = require('../method-lists/list-class-methods');
  var queryMethods = require('../method-lists/query-methods');

  function ModelMiddleware () { // uses Model and key from closure
    return BaseMiddleware.call(this, Model, key);
  }
  util.inherits(ModelMiddleware, BaseMiddleware);
  /***
   * Chainable methods (must be set first before Class Methods)
   */
  queryMethods.forEach(function (method) {
    ModelMiddleware.prototype[method] = function () {
      if (this.methodChain.length === 0) {
        throw new Error(method+' can only be used in a chain (..<method>.'+method+'..)');
      }
      // TODO: warn of potential non responding middlewares
      // this.queryChained = true;
      this.methodChain.push({
        method: method,
        args: Array.prototype.slice.call(arguments)
      });

      return this;
    };
  });
  /***
   * Class methods
   */
  listClassMethods(Model).forEach(function (method) {
    ModelMiddleware.prototype[method] = function () {
      this.methodChain.push({
        method: method,
        args: Array.prototype.slice.call(arguments)
      });

      return this;
    };
  });
  /***
   * Extended Class Methods
   */
  ModelMiddleware.prototype.new = function () {
    if (this.methodChain.length) {
      throw new Error('New (.new) cannot be used in a chain');
    }
    var argsWithPlaceholders = Array.prototype.slice.call(arguments);
    var self = this;
    return function (req, res, next) {
      var args = replacePlaceholders(req, argsWithPlaceholders);
      req[self.modelKey] = new ModelMiddleware(args[0]);
      next();
    };
  };
  Object.keys(Model.schema.statics).forEach(function (method) {
    ModelMiddleware.prototype[method] = function () {
      this.methodChain.push({
        method: method,
        args: Array.prototype.slice.call(arguments)
      });

      return this;
    };
  });
  ModelMiddleware.prototype.exec = function (keyOverride) {
    var self = this;
    return function (req, res, next) {
      var result = reduceSteps(req, self.Model, self.methodChain);
      result.exec(function (err, data) {
        if (err) {
          return next(err);
        }
        else if (Array.isArray(data)) {
          req[keyOverride || self.collectionKey] = data;
        }
        else {
          req[keyOverride || self.modelKey] = data;
        }
        next();
      });
    };
  };

  return ModelMiddleware;
}