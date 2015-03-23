var util = require('util');
var last = require('101/last');
var BaseMiddleware = require('../base-middleware');
var inflect = require('i')();
var reduceSteps = require('../reduce-steps');
var replacePlaceholders = require('../replace-placeholders');
var listInstanceMethods = require('../method-lists/list-instance-methods');
var queryMethods = require('../method-lists/query-methods');
var mw = require('dat-middleware');

module.exports = createCollectionMiddlewareClass;

function createCollectionMiddlewareClass (Model, key, instanceMiddlewareFactory) {
  function CollectionMiddleware () { // uses Model and key from closure
    var mw = BaseMiddleware.call(this, Model, key);
    mw.instanceChainMiddleware = instanceMiddlewareFactory('item');
    return mw;
  }
  util.inherits(CollectionMiddleware, BaseMiddleware);
  /***
   * Methods
   */
  listInstanceMethods(Model).forEach(function (method) {
    CollectionMiddleware.prototype[method] = function () {
      var ctx = this.instanceChainMiddleware;
      this.instanceChainMiddleware = ctx[method].apply(ctx, arguments);
      return this;
    };
  });
  /***
   * Extended Methods
   */
  CollectionMiddleware.prototype.exec = function (keyOverride) {
    var self = this;
    var collectionKey = keyOverride || self.collectionKey;
    var indexKey = collectionKey+'Index';
    return function (req, res, next) {
      var index = 1;
      var collection = req[self.collectionKey];
      var collectionOut = [];

      mw.req(self.collectionKey).each( // self.collectionKey is correct here
        function (item, req, eachReq, res, next) {
          eachReq.item = item;
          eachReq[indexKey] = index;
          index++;
          next();
        },
        self.instanceChainMiddleware,
        function (item, req, eachReq, res, next) {
          var index = req[indexKey];
          collectionOut[index] = eachReq.item;
          if (eachReq[indexKey] === collection.length) {
            req[collectionKey] = collectionOut;
          }
          next();
        }
      )(req, res, next);
    };
  };

  return CollectionMiddleware;
}