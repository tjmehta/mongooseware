var i = require('i')();
var isObject = require('101/is-object');
var createModelMiddlewareClass = require('./lib/middleware-class-factories/model');
var createInstanceMiddleware = require('./lib/middleware-class-factories/instance');
var listClassMethods = require('./lib/method-lists/list-class-methods');

module.exports = createMongooseware;

function createMongooseware (Model, key) {
  var classMiddlewareFactoryMethods = {};
  var ModelMiddleware = createModelMiddlewareClass(Model, key);
  var InstanceMiddleware = createInstanceMiddleware(Model, key);

  listClassMethods(Model).forEach(function (method) {
    classMiddlewareFactoryMethods[method] = function () {
      var modelMiddleware = new ModelMiddleware();

      modelMiddleware[method].apply(modelMiddleware, arguments);

      return modelMiddleware;
    };
  });

  classMiddlewareFactoryMethods.model = instanceMiddlewareFactory;

  function instanceMiddlewareFactory (keyOverride) {
    var instanceMiddleware = new InstanceMiddleware();
    if (keyOverride) {
      instanceMiddleware.setKey(keyOverride);
    }
    return instanceMiddleware;
  }

  // classMiddlewareFactoryMethods.collection = function (keyOverride) {
  //   var modelInstanceMiddleware = createModelInstanceMiddleware(Model, keyOverride || key);
  //   return modelInstanceMiddleware;
  // };

  return classMiddlewareFactoryMethods;
}