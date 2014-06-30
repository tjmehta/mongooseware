var express = require('express');
var mw = require('dat-middleware');
var parser = require('body-parser');
var next = function (req, res, next) {next();};

module.exports = function createAppWithMiddlewares (/* middlewares */) {
  var middlewares = Array.prototype.slice.call(arguments);

  var app = express();
  app.use(parser.json());
  app.use(parser.urlencoded());
  middlewares.forEach(function (middleware) {
    app.all('*', middleware);
  });
  app.use(mw.errorHandler());

  return app;
};