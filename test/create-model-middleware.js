'use strict';

var Lab = require('lab');
var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = require('code').expect;
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
