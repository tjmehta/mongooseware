'use strict';

var Lab = require('lab');
var exists = require('101/exists');
var mw = require('dat-middleware');
var pluck = require('101/pluck');
var request = require('supertest');

var User = require('./fixtures/user-model');
var createAppWithMiddleware = require('./fixtures/create-app-with-middlewares');
var createMongooseware = require('../index');

var lab = exports.lab = Lab.script();
var after = lab.after;
var before = lab.before;
var describe = lab.describe;
var expect = require('code').expect;
var it = lab.it;

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
  describe('new', function () {
    it('should create a model instance', function (done) {
      var users = createMongooseware(User);
      var userInfo = { name: 'yolo' };
      var app = createAppWithMiddleware(
        users.new(userInfo),
        users.model().save(),
        mw.res.json(201, 'user')
      );

      request(app)
        .get('/')
        .expect(201)
        .end(function (err, res) {
          if (err) { return done(err); }
          expect(res.body.name).to.equal(userInfo.name);
          done();
        });
    });
    describe('error', function () {
      it('should create a model instance', function (done) {
        var users = createMongooseware(User);
        var userInfo = { name: 'yolo' };

        try {
          var app = createAppWithMiddleware(
            users.find().new(userInfo),
            users.model().save(),
            mw.res.json(201, 'user')
          );
        }
        catch (err) {
          // new cannot be chained
          expect(err).to.exist();
        }
        done();
      });
    });
  });
  describe('error', function () {
    it('should find documents and limit the results with custom static method', function (done) {
      var users = createMongooseware(User);

      var app = createAppWithMiddleware(
        users.callbackError(),
        mw.res.send('user')
      );

      request(app)
        .get('/')
        .expect(500)
        .end(function (err, res) {
          if (err) { return done(err); }
          expect(res.body).to.deep.equal({message:'boom'});
          done();
        });
    });
  });
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

            expect(res.body).to.be.an.object();
            expect(res.body.name).to.equal(query.name);
            done();
          });
      });

    });
    describe('find', function () {
      before(function (done) {
        var users = createMongooseware(User);
        var queryMiddleware = opts.useExec ?
          users.find().exec(opts.keyOverride) :
          users.find();
        ctx.app = createAppWithMiddleware(
          queryMiddleware,
          mw.res.send(opts.keyOverride || 'users')
        );
        done();
      });
      it('should set documents to the collection key', function (done) {
        var app = ctx.app;
        request(app)
          .get('/')
          .expect(200)
          .end(function (err, res) {
            if (err) { return done(err); }

            expect(res.body).to.be.an.array();
            expect(res.body).to.have.length(ctx.users.length);
            expect(res.body.map(pluck('name')))
              .to.deep.equal(ctx.users.map(pluck('name')));
            done();
          });
      });
      describe('reuse', function () {
        it('should set documents to the collection key', function (done) {
          var app = ctx.app;
          request(app)
            .get('/')
            .expect(200)
            .end(function (err, res) {
              if (err) { return done(err); }

              expect(res.body).to.be.an.array();
              expect(res.body).to.have.length(ctx.users.length);
              expect(res.body.map(pluck('name')))
                .to.deep.equal(ctx.users.map(pluck('name')));
              done();
            });
        });
      });
    });
    describe('customFindNoChain', function() {
      before(function (done) {
        var users = createMongooseware(User);
        var queryMiddleware = opts.useExec ?
          users.customFindNoChain().exec(opts.keyOverride) :
          users.customFindNoChain();
        ctx.app = createAppWithMiddleware(
          queryMiddleware,
          mw.res.send(opts.keyOverride || 'users')
        );
        done();
      });
      it('should set documents to the collection key', function (done) {
        var app = ctx.app;
        request(app)
          .get('/')
          .expect(200)
          .end(function (err, res) {
            if (err) { return done(err); }

            expect(res.body).to.be.an.array();
            expect(res.body).to.have.length(ctx.users.length);
            expect(res.body.map(pluck('name')))
              .to.deep.equal(ctx.users.map(pluck('name')));
            done();
          });
      });
      describe('reuse', function () {
        it('should set documents to the collection key', function (done) {
          var app = ctx.app;
          request(app)
            .get('/')
            .expect(200)
            .end(function (err, res) {
              if (err) { return done(err); }

              expect(res.body).to.be.an.array();
              expect(res.body).to.have.length(ctx.users.length);
              expect(res.body.map(pluck('name')))
                .to.deep.equal(ctx.users.map(pluck('name')));
              done();
            });
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

            expect(res.body).to.be.an.object();
            expect(res.body._id).to.satisfy(exists);
            expect(res.body.name).to.equal(body.name);
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

              expect(res.body).to.be.an.array();
              expect(res.body).to.have.length(limit);
              done();
            });
        });
      });
    });
    describe('chain', function () {
      describe('find and limit', function () {
        before(function (done) {
          var users = createMongooseware(User);
          ctx.limit = 1;
          var queryMiddleware = opts.useExec ?
            users.customFind().limit(ctx.limit).exec(opts.keyOverride) :
            users.customFind().limit(ctx.limit);

          ctx.app = createAppWithMiddleware(
            queryMiddleware,
            mw.res.send(opts.keyOverride || 'users')
          );
          done();
        });
        it('should find documents and limit the results with custom '+
           'static method', function (done) {
          var app = ctx.app;
          request(app)
            .get('/')
            .expect(200)
            .end(function (err, res) {
              if (err) { return done(err); }

              expect(res.body).to.be.an.array();
              expect(res.body).to.have.length(ctx.limit);
              done();
            });
        });
        describe('reuse', function() {
          it('should find documents and limit the results with custom'+
             ' static method', function (done) {
            var app = ctx.app;
            request(app)
              .get('/')
              .expect(200)
              .end(function (err, res) {
                if (err) { return done(err); }

                expect(res.body).to.be.an.array();
                expect(res.body).to.have.length(ctx.limit);
                done();
              });
          });
        });
      });
    });
  };
}
