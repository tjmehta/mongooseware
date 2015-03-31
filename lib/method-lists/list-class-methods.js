/**
 * Helper
 * Retrieve list of all non-private class methods
 * @module lib/method-lists/list-class-methods
 */
'use strict';

var isFunction = require('101/is-function');
var isPrivateMethod = require('./is-private-method');

module.exports = listClassMethods;

/**
 * Returns list of non-private class methods
 * @param {Object} Model
 * @return {Array}
 */
function listClassMethods (Model) {
  var classMethods = Object.keys(Model.schema.statics);
  for (var method in Model) {
    if (!isPrivateMethod(method) && isFunction(Model[method])) {
      classMethods.push(method);
    }
  }
  return classMethods;
}
