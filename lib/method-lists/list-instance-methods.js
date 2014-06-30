var isFunction = require('101/is-function');
var isPrivateMethod = require('./is-private-method');
var ModelPrototype = require('mongoose/lib/model').prototype;

module.exports = listInstanceMethods;

function listInstanceMethods (Model) {
  var classMethods = Object.keys(Model.schema.methods);

  for (var method in ModelPrototype) {
    if (!isPrivateMethod(method) && isFunction(ModelPrototype[method])) {
      classMethods.push(method);
    }
  }

  return classMethods;
}