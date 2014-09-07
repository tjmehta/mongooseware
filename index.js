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

  classMiddlewareFactoryMethods.new = function () {
    var modelMiddleware = new ModelMiddleware();

    return modelMiddleware['new'].apply(modelMiddleware, arguments);
  };

  var defaultInstanceMiddleware = instanceMiddlewareFactory(key);

  classMiddlewareFactoryMethods.model = function (key) {
    if (arguments.length === 3) { // use default instancem middleware constructor
      var req  = arguments[0];
      var res  = arguments[1];
      var next = arguments[2];
      return defaultInstanceMiddleware(req, res, next);
    }
    else { // instance middleware factory
      return instanceMiddlewareFactory(key);
    }
  };

  classMiddlewareFactoryMethods.model.__proto__ = defaultInstanceMiddleware;

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