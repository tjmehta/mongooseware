var inflect = require('i')();

module.exports = BaseMiddleware;

function BaseMiddleware (Model, key) { // uses Model and key from closure
  // constructor
  var instance = function (req, res, next) {
    return instance.exec()(req, res, next);
  };
  instance.Model = Model;
  instance.methodChain = [];
  instance.__proto__ = this.__proto__;
  // if (!instance.setKey) {
    instance.setKey = function (key) {
      key = key || Model.modelName;
      instance.modelKey = inflect.singularize(key);
      instance.collectionKey = inflect.pluralize(key);
    };
  // }
  instance.setKey(key);
  return instance;
}

BaseMiddleware.prototype = {};