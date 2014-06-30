var Lab = require('lab');
var describe = Lab.experiment;
var it = Lab.test;
var before = Lab.before;
var after = Lab.after;
var beforeEach = Lab.beforeEach;
var afterEach = Lab.afterEach;
var expect = Lab.expect;
var createMongooseware = require('../index');
var User = require('./fixtures/user-model');
var createAppWithMiddleware = require('./fixtures/create-app-with-middlewares');
var request = require('supertest');
var pluck = require('101/pluck');
var mw = require('dat-middleware');

describe('model instance methods', function () {
  var ctx = {};
  before(require('./fixtures/mongoose-connect'));
  before(function (done) {
    ctx.users = [
      { name: 'user1' },
      { name: 'user2' },
      { name: 'user3' }
    ];
    User.remove({}, function () {
      User.create(ctx.users, done);
    });
  });
  after(function (done) {
    ctx = {};
    User.remove({}, done);
  });
  describe('sync methods',
    syncMethodTests(ctx, { useExec: false }));
  describe('sync methods w/ keyOverride',
    syncMethodTests(ctx, { useExec: true, keyOverride: 'custom' }));
  describe('sync methods w/ .sync',
    syncMethodTests(ctx, { useExec: false, useSync: true }));
});

function syncMethodTests (opts) {
  return function () {
    describe('findOne set and save', function() {
      it('findOne should set documents to the model key', function (done) {
        var users = createMongooseware(User);
        var query = { name: 'user1' };
        var queryMiddleware = opts.useExec ?
          users.findOne(query).exec(opts.keyOverride) :
          users.findOne(query);
        var setProps = { name: 'newName' };
        var setMiddleware = opts.keyOverride ?
          users.model(opts.keyOverride).set(setProps) :
          users.model().set(setProps);
        if (opts.useSync) {
          setMiddleware = setMiddleware.sync('name');
        }

        var app = createAppWithMiddleware(
          queryMiddleware,
          setMiddleware,
          mw.res.send(opts.keyOverride || 'user')
        );

        request(app)
          .get('/')
          .expect(200)
          .end(function (err, res) {
            if (err) { return done(err); }

            expect(res.body).to.be.an('object');
            expect(res.body.name).to.equal('newName');
            done();
          });
      });
    });
  };
}