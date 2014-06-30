var inflect = require('i')();

module.exports = BaseMiddleware;

function BaseMiddleware (Model, key) { // uses Model and key from closure
  key = key || inflect.singularize(Model.modelName);
  var pluralKey = inflect.pluralize(key);

  if (this instanceof BaseMiddleware) {
    // constructor
    var instance = function (req, res, next) {
      return instance.exec()(req, res, next);
    };
    instance.Model = Model;
    instance.modelKey = key;
    instance.collectionKey = pluralKey;
    instance.methodChain = [];
    instance.__proto__ = this.__proto__;

    return instance;
  }
  // TODO: warn of potential non responding middlewares
  // else if (this.queryChained) {
  //   throw new Error('missing .exec at the end of the query chain');
  // }
  else {
    if (this.methodChain.length === 0) {
      throw new Error('middleware has no methods');
    }
    else {
      this.exec.apply(this, arguments);
    }
  }
}

BaseMiddleware.prototype = {};