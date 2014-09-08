var Lab = require('lab');
var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var expect = Lab.expect;
var createMongooseware = require('../index');
var User = require('./fixtures/user-model');
var createAppWithMiddleware = require('./fixtures/create-app-with-middlewares');
var request = require('supertest');
var pluck = require('101/pluck');
var mw = require('dat-middleware');
var customObj = new Custom();
function Custom () {}

describe('model instance methods', function () {
  var ctx = {};
  before(require('./fixtures/mongoose-connect'));
  beforeEach(function (done) {
    ctx.users = [
      { name: 'user1' },
      { name: 'user2' },
      { name: 'user3' }
    ];
    User.remove({}, function (err) {
      if (err) { return done(err); }
      User.create(ctx.users, done);
    });
  });
  afterEach(function (done) {
    User.remove({}, done);
  });
  describe('sync methods',
    syncMethodTests({ useExec: false }));
  describe('sync methods w/ exec',
    syncMethodTests({ useExec: true }));
  describe('sync methods w/ keyOverride',
    syncMethodTests({ useExec: true, keyOverride: 'custom' }));
  describe('sync methods w/ .sync',
    syncMethodTests({ useExec: false, useSync: true }));
  describe('async methods',
    asyncMethodTests({ useExec: false }));
  describe('async methods w/ keyOverride',
    asyncMethodTests({ useExec: true, keyOverride: 'custom' }));
  describe('async methods w/ .sync',
    asyncMethodTests({ useExec: false, useSync: true }));
  describe('error', function () {
    it('should find documents and limit the results with custom static method', function (done) {
      var users = createMongooseware(User);

      var app = createAppWithMiddleware(
        users.findOne({}),
        users.model().callbackError(),
        mw.res.send('user')
      );

      request(app)
        .get('/')
        .expect(500)
        .end(function (err, res) {
          if (err) { return done(err); }
          expect(res.body).to.eql({message:'boom'});
          done();
        });
    });
  });
  describe('error', function () {
    it('should find documents and limit the results with custom static method', function (done) {
      var users = createMongooseware(User);

      var app = createAppWithMiddleware(
        users.findOne({}),
        users.model().syncError().sync(),
        mw.res.send('user')
      );

      request(app)
        .get('/')
        .expect(500)
        .end(function (err, res) {
          if (err) { return done(err); }
          expect(res.body).to.eql({message:'boom'});
          done();
        });
    });
  });
  describe('error (model no parens)', function () {
    it('should find documents and limit the results with custom static method', function (done) {
      var users = createMongooseware(User);

      var app = createAppWithMiddleware(
        users.findOne({}),
        users.model.callbackError(),
        mw.res.send('user')
      );

      request(app)
        .get('/')
        .expect(500)
        .end(function (err, res) {
          if (err) { return done(err); }
          expect(res.body).to.eql({message:'boom'});
          done();
        });
    });
  });
  describe('collection', function () {
    it('should find documents and async forEach each model.method', function (done) {
      var users = createMongooseware(User);

      var app = createAppWithMiddleware(
        users.find(),
        users.collection().set('lastName', 'bar'),
        mw.res.send('users')
      );

      request(app)
        .get('/')
        .expect(200)
        .end(function (err, res) {
          if (err) { return done(err); }
          expect(res.body).to.be.an('array');
          res.body.forEach(function (user) {
            expect(user.lastName).to.eql('bar');
          });
          done();
        });
    });
    it('should find documents and async forEach each model.method (specify key)', function (done) {
      var users = createMongooseware(User);

      var app = createAppWithMiddleware(
        users.find(),
        users.collection().set('lastName', 'bar').exec('humans'),
        mw.res.send('humans')
      );

      request(app)
        .get('/')
        .expect(200)
        .end(function (err, res) {
          if (err) { return done(err); }
          expect(res.body).to.be.an('array');
          res.body.forEach(function (user) {
            expect(user.lastName).to.equal('bar');
          });
          done();
        });
    });
    it('should find documents and async forEach each model.method (collection without parens)', function (done) {
      var users = createMongooseware(User);

      var app = createAppWithMiddleware(
        users.find(),
        users.collection.set('lastName', 'bar'),
        mw.res.send('users')
      );

      request(app)
        .get('/')
        .expect(200)
        .end(function (err, res) {
          if (err) { return done(err); }
          expect(res.body).to.be.an('array');
          res.body.forEach(function (user) {
            expect(user.lastName).to.eql('bar');
          });
          done();
        });
    });
  });
});

function syncMethodTests (opts) {
  return function () {
    it('should findOne and set a key and send a document', function (done) {
      var key = opts.keyOverride || 'user';
      var users = createMongooseware(User);
      var query = { name: 'user1' };
      var queryMiddleware = opts.keyOverride ?
        users.findOne(query).exec(key) :
        users.findOne(query);
      var setProps = { name: 'newName' };
      var setMiddleware = opts.useExec ?
        users.model(opts.keyOverride).set(setProps) :
        users.model().set(setProps);
      if (opts.useSync) {
        setMiddleware = setMiddleware.sync('name');
      }

      var app = createAppWithMiddleware(
        queryMiddleware,
        checkFound(opts.keyOverride || 'user'),
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
  };
}

function asyncMethodTests (opts) {
  return function () {
    it('should findOne update and find updated document', function (done) {
      var key = opts.keyOverride || 'user';
      var users = createMongooseware(User);
      var query = { name: 'user1' };
      var queryMiddleware = opts.useExec ?
        users.findOne(query).exec(key) :
        users.findOne(query);
      var setProps = {
        name: 'newName',
        foo: customObj, // replace-placeholders coverage
        bar: { baz: ['what'] },
        baz: null
      };
      var setMiddleware = users.model(opts.keyOverride).set('lastName', 'numDocs');
      if (opts.useSync) {
        setMiddleware = setMiddleware.sync('name');
      }
      var findById = opts.useExec ?
        users.findById(key+'._id').exec(key) :
        users.findById(key+'._id');
      var app = createAppWithMiddleware(
        queryMiddleware,
        checkFound(key),
        users.model(opts.keyOverride)
          .update(setProps).exec('numDocs'),
        findById,
        setMiddleware,
        mw.res.send(key)
      );

      request(app)
        .get('/')
        .expect(200)
        .end(function (err, res) {
          if (err) { return done(err); }
          expect(res.body).to.be.an('object');
          expect(res.body.name).to.equal('newName');
          expect(res.body.lastName).to.equal("1");
          done();
        });
    });
  };
}

function checkFound (key) {
  return function (req, res, next) {
    if (!req[key]) {
      res.send(404, {message:'user not found'});
    }
    else {
      next();
    }
  };
}