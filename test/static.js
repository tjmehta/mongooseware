var Lab = require('lab');

var describe = Lab.experiment;
var it = Lab.test;
var expect = Lab.expect;
var beforeEach = Lab.beforeEach;
var afterEach = Lab.afterEach;

var createAppwithMiddlewares = require('./fixtures/create-app-with-middlewares');
var mongo = require('./fixtures/mongo');

describe('static', function () {
  var ctx = {};
  beforeEach(mongo.init);
  afterEach(mongo.clear);

  describe('mongoose static methods as middleware', function() {
    beforeEach(function (done) {
      ctx.app = createAppwithMiddlewares(

      );
      done();
    });
  });
  describe('extended static methods as middleware', function() {

  });
  it('returns true when 1 + 1 equals 2', function (done) {
    expect(1+1).to.equal(2);
    done();
  });
});