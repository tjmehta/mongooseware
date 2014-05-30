var express = require('express');

module.exports = function createAppWithMiddlewares (middlewares) {
  var app = express();

  app.use(express.json());
  app.use(express.urlencoded());
  middlewares.forEach(function (mw) {
    app.use(mw);
  });
  app.use(errorHandler);

  return app;
};

function inspect (req, res, next) {
  console.log('req.body', req.body);
  console.log('req.query', req.query);
  console.log('req.params', req.params);
  next();
}

function errorHandler (err, req, res, next) {
  res.json(500, err);
}