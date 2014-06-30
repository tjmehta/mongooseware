var mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/create_model_mw_test");

module.exports = ensureMongooseIsConnected;

function ensureMongooseIsConnected (cb) {
  if (mongoose.connection.readyState === 1) {
    cb();
  }
  else {
    mongoose.connection.once('connected', cb);
  }
}