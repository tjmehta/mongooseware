var isFunction = require('101/is-function');
var isPrivateMethod = require('./is-private-method');
var Model = require('mongoose/lib/model');

module.exports = listClassMethods;

function listClassMethods (Model) {
  var classMethods = Object.keys(Model.schema.statics);

  for (var method in Model) {
    if (!isPrivateMethod(method) && isFunction(Model[method])) {
      classMethods.push(method);
    }
  }

  return classMethods;
}