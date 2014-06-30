module.exports = isPrivateMethod;

function isPrivateMethod (methodName) {
  return methodName.indexOf('_') === 0 ||
         methodName.indexOf('$_') === 0;
}