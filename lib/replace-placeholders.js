var exists = require('101/exists');
var isObject = require('101/is-object');
var keypather = require('keypather')();

module.exports = replacePlaceholders;

function replacePlaceholders (ctx, args) {
  function handle (thing) {
    if (Array.isArray(thing)) {
      return thing.map(handle);
    }
    else if (isObject(thing)) {
      return handleObject(thing);
    }
    else if (typeof thing === 'string') {
      var val = keypather.get(ctx, thing);
      return exists(val) ? val : thing;
    }
    else {
      return thing;
    }
  }
  function handleObject (obj) {
    if (Object.getPrototypeOf(obj).constructor.name !== 'Object') {
      //ignore special objects like ObjectIds
      return obj;
    }
    var out = {};
    Object.keys(obj).forEach(function (key) {
      out[key] = handle(obj[key]);
    });
    return out;
  }
  return handle(args);
}