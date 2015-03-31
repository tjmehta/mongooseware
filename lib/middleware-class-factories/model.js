/**
 * TODO: document
 * @module lib/middleware-class-factories/model
 */
'use strict';

var util = require('util');

var BaseMiddleware = require('../base-middleware');
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
  Object.keys(Model.schema.statics).forEach(function (method) {
    ModelMiddleware.prototype[method] = function () {
      this.methodChain.push({
        method: method,
        args: Array.prototype.slice.call(arguments)
      });

      return this;
    };
  });
  ModelMiddleware.prototype.new = function () {
    if (this.methodChain.length) {
      throw new Error('New (.new) cannot be used in a chain');
    }
    var argsWithPlaceholders = Array.prototype.slice.call(arguments);
    var self = this;
    return function (req, res, next) {
      var args = replacePlaceholders(req, argsWithPlaceholders);
      req[self.modelKey] = new Model(args[0]);
      next();
    };
  };
  ModelMiddleware.prototype.exec = function (/* keys */) {
    var self = this;
    var origKeys = Array.prototype.slice.call(arguments);
    return function (req, res, next) {
      (function (req, res, next) {
        var keys = origKeys.slice(); // copy
        var result = reduceSteps(req, self.Model, self.methodChain, callback);
        if (result && result.exec) {
          result.exec(callback);
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
            keys[0] = keys[0] ||
              (Array.isArray(datas[0]) ? self.collectionKey : self.modelKey);

            keys.forEach(function (key, i) {
              req[key] = datas[i];
            });
            next();
          }
        }
      })(req, res, next);
    };
  };

  return ModelMiddleware;
}
