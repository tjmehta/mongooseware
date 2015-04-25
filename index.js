/**
 * TODO: description
 * @module index
 */
'use strict';
// jshint proto:true

var createCollectionMiddlewareClass = require('./lib/middleware-class-factories/collection');
var createInstanceMiddlewareClass = require('./lib/middleware-class-factories/instance');
var createModelMiddlewareClass = require('./lib/middleware-class-factories/model');
var listClassMethods = require('./lib/method-lists/list-class-methods');

module.exports = createMongooseware;

/**
 *
 * @param {Object} Model
 * @param {String} key
 */
function createMongooseware (Model, key) {
  var classMiddlewareFactoryMethods = {};
  var ModelMiddleware = createModelMiddlewareClass(Model, key);
  var InstanceMiddleware = createInstanceMiddlewareClass(Model, key);
  var CollectionMiddleware = createCollectionMiddlewareClass(Model, key, instanceMiddlewareFactory);

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

  // model middleware
  //
  Object.defineProperty(
    classMiddlewareFactoryMethods,
    'model', {
    get: function () {
      var defaultInstanceMiddleware = instanceMiddlewareFactory(key);

      function model (key) {
        if (arguments.length === 3) { // use default instance middleware constructor
          var req  = arguments[0];
          var res  = arguments[1];
          var next = arguments[2];
          return defaultInstanceMiddleware(req, res, next);
        }
        else { // instance middleware factory
          return instanceMiddlewareFactory(key);
        }
      }

      model.__proto__ = defaultInstanceMiddleware;

      return model;
    }
  });

  function instanceMiddlewareFactory (keyOverride) {
    var instanceMiddleware = new InstanceMiddleware();
    if (keyOverride) {
      instanceMiddleware.setKey(keyOverride);
    }
    return instanceMiddleware;
  }

  // collection middleware

  Object.defineProperty(
    classMiddlewareFactoryMethods,
    'collection', {
    get: function () {
      var defaultInstanceMiddleware = instanceMiddlewareFactory(key);
      var defaultCollectionMiddleware = 
        collectionMiddlewareFactory(defaultInstanceMiddleware.collectionKey);

      function collection (key) {
        if (arguments.length === 3) { // use default instance middleware constructor
          var req  = arguments[0];
          var res  = arguments[1];
          var next = arguments[2];
          return defaultCollectionMiddleware(req, res, next);
        }
        else { // instance middleware factory
          return collectionMiddlewareFactory(key);
        }
      }

      collection.__proto__ = defaultCollectionMiddleware;

      return collection;
    }
  });

  function collectionMiddlewareFactory (keyOverride) {
    var collectionMiddleware = new CollectionMiddleware();
    if (keyOverride) {
      collectionMiddleware.setKey(keyOverride);
    }
    return collectionMiddleware;
  }

  classMiddlewareFactoryMethods.models = classMiddlewareFactoryMethods.collection;

  return classMiddlewareFactoryMethods;
}
