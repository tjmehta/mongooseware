/**
 * TODO: document
 * @module lib/base-middleware
 */
'use strict';
// jshint proto:true

var inflect = require('i')();

module.exports = BaseMiddleware;

/**
 * uses Model and key from closure
 * @param {Object} Model
 * @param {String} key
 * @return {Object}
 */
function BaseMiddleware (Model, key) {
  // constructor
  var instance = function (req, res, next) {
    return instance.exec()(req, res, next);
  };
  instance.Model = Model;
  instance.methodChain = [];

  instance.__proto__ = this.__proto__;

  instance.setKey = function (key) {
    key = key || Model.modelName.toLowerCase();
    instance.modelKey = inflect.singularize(key);
    instance.collectionKey = inflect.pluralize(key);
  };
  instance.setKey(key);
  return instance;
}

BaseMiddleware.prototype = {};
