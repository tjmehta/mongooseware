var QueryPrototype = require('mongoose/lib/query').prototype;

var queryMethods = [];
for (var method in QueryPrototype) {
  queryMethods.push(method);
}

module.exports = queryMethods;