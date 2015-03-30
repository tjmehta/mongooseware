/**
 * Helper
 * Get list of all instance methods
 * @module lib/method-lists/list-instance-methods
 */
'use strict';

var isFunction = require('101/is-function');
var isPrivateMethod = require('./is-private-method');
var ModelPrototype = require('mongoose/lib/model').prototype;

module.exports = listInstanceMethods;

/**
 * Return list of all instance methods when supplied a Model constructor
 * @param {Object} Model
 * @return {Array}
 */
function listInstanceMethods (Model) {
  var classMethods = Object.keys(Model.schema.methods);
  for (var method in ModelPrototype) {
    if (!isPrivateMethod(method) && isFunction(ModelPrototype[method])) {
      classMethods.push(method);
    }
  }
  return classMethods;
}
