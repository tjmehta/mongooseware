var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
  name: { type: String }
});

module.exports = mongoose.model('user', UserSchema);