/*
* More details here http://mongoosejs.com/docs/guide.html
*/

var mongoose = require("mongoose");

//connect to database
var db = mongoose.connect('mongodb://127.0.0.1:27017/test');

//create schema for model
var userSchema = new mongoose.Schema({
  name:  String,
  type:  String
});

userSchema.statics.findByName = function (name /*, args.. */) {
  var args = Array.prototype.slice.call(1);
  var query = { name: name };
  args = [query].concat(args);
  return this.findOne.apply(this, args);
};

userSchema.methods.err = function (cb) {
  cb(new Error('static boom'));
};

userSchema.methods.setAndSave = function (props, cb) {
  this.set(props);
  return this.save(cb);
};

userSchema.methods.del = function (key) {
  delete this[key];
  return this;
};

userSchema.methods.err = function (cb) {
  cb(new Error('methods boom'));
};

//compile schema to model
module.exports = db.model('users', userSchema);