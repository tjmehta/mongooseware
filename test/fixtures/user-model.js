var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
  name: { type: String },
  lastName: { type: String }
});

UserSchema.statics.customFind = function () {
  return this.find.apply(this, arguments);
};

UserSchema.statics.customFindNoChain = function () {
  this.find.apply(this, arguments);
};

UserSchema.statics.callbackError = function (cb) {
  cb(new Error('boom'));
};

UserSchema.methods.updateLastNameToFoo = function (cb) {
  return this.update({name:'foo'}, cb);
};

UserSchema.methods.callbackError = function (cb) {
  cb(new Error('boom'));
};

UserSchema.methods.throwError = function () {
  throw new Error('boom');
};

UserSchema.methods.syncError = function () {
  throw new Error('boom');
};

module.exports = mongoose.model('user', UserSchema);