/**
 * Helper.
 * Determine if method is public or private
 * @module lib/method-lists/is-private-method
 */
'use strict';

module.exports = isPrivateMethod;

/**
 * Return true if method is private, determined by method name/prefix
 * @param {String} methodName
 * @return {Boolean}
 */
function isPrivateMethod (methodName) {
  return methodName.indexOf('_') === 0 ||
         methodName.indexOf('$_') === 0;
}
