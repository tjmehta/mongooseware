/**
 * Retrieve array of all prototype methods on mongoose query module
 * NOTE: will switch implementation to use 101/values when available
 * @module lib/method-lists/query-methods
 */
'use strict';

var QueryPrototype = require('mongoose/lib/query').prototype;

var queryMethods = [];
for (var method in QueryPrototype) {
  queryMethods.push(method);
}

module.exports = queryMethods;
