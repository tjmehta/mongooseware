var Lab = require('lab');
var describe = Lab.experiment;
var it = Lab.test;
var before = Lab.before;
var after = Lab.after;
var beforeEach = Lab.beforeEach;
var afterEach = Lab.afterEach;
var expect = Lab.expect;
var createModelMiddlewareClass = require('../lib/middleware-class-factories/model');
var User = require('./fixtures/user-model');

describe('createModelMiddleware', function () {
  describe('constructor', function() {
    it('should take a mongoose model and create middleware class', function (done) {
      var UserMiddleware = createModelMiddlewareClass(User);
      var userMw = new UserMiddleware();
      expect(userMw.modelKey).to.equal('user');
      expect(userMw.collectionKey).to.equal('users');
      done();
    });
  });
});