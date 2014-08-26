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
var exists = require('101/exists');
var mw = require('dat-middleware');

describe('model static methods', function () {
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
  describe('async methods',
    asyncMethodTests(ctx, { useExec: false }));
  describe('async methods (with .exec())',
    asyncMethodTests(ctx, { useExec: true }));
  describe('async methods (with .exec("custom"))',
    asyncMethodTests(ctx, { useExec: true, keyOverride: 'custom' }));
});


function asyncMethodTests (ctx, opts) {
  return function () {
    describe('findOne', function () {
      it('should set documents to the model key', function (done) {
        var users = createMongooseware(User);
        var query = { name: 'user1' };
        var queryMiddleware = opts.useExec ?
          users.findOne(query).exec(opts.keyOverride) :
          users.findOne(query);

        var app = createAppWithMiddleware(
          queryMiddleware,
          mw.res.send(opts.keyOverride || 'user')
        );

        request(app)
          .get('/')
          .expect(200)
          .end(function (err, res) {
            if (err) { return done(err); }

            expect(res.body).to.be.an('object');
            expect(res.body.name).to.equal(query.name);
            done();
          });
      });

    });
    describe('find', function () {
      it('should set documents to the collection key', function (done) {
        var users = createMongooseware(User);
        var queryMiddleware = opts.useExec ?
          users.find().exec(opts.keyOverride) :
          users.find();

        var app = createAppWithMiddleware(
          queryMiddleware,
          mw.res.send(opts.keyOverride || 'users')
        );

        request(app)
          .get('/')
          .expect(200)
          .end(function (err, res) {
            if (err) { return done(err); }

            expect(res.body).to.be.an('array');
            expect(res.body).to.have.a.lengthOf(ctx.users.length);
            expect(res.body.map(pluck('name')))
              .to.eql(ctx.users.map(pluck('name')));
            done();
          });
      });
    });
    describe('create', function () {
      after(function (done) {
        ctx = {};
        User.remove({ name: 'yolo' }, done);
      });
      it('should create a document', function (done) {
        var users = createMongooseware(User);
        var app = createAppWithMiddleware(
          users.create({ name: 'body.name' }),
          mw.res.send(201, 'user')
        );
        var body = { name: 'yolo' };
        request(app)
          .post('/')
          .send(body)
          .expect(201)
          .end(function (err, res) {
            if (err) { return done(err); }

            expect(res.body).to.be.an('object');
            expect(res.body._id).to.satisfy(exists);
            expect(res.body.name).to.eql(body.name);
            done();
          });
      });
    });
    describe('chain', function () {
      describe('find and limit', function () {
        it('should find documents and limit the results', function (done) {
          var users = createMongooseware(User);
          var limit = 1;
          var queryMiddleware = opts.useExec ?
            users.find().limit(1).exec(opts.keyOverride) :
            users.find().limit(1);

          var app = createAppWithMiddleware(
            queryMiddleware,
            mw.res.send(opts.keyOverride || 'users')
          );

          request(app)
            .get('/')
            .expect(200)
            .end(function (err, res) {
              if (err) { return done(err); }

              expect(res.body).to.be.an('array');
              expect(res.body).to.have.a.lengthOf(limit);
              done();
            });
        });
      });
    });
  };
}