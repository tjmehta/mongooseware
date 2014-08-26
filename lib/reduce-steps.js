var replacePlaceholders = require('./replace-placeholders');

module.exports = reduceSteps;

function reduceSteps (req, memo, steps) {
  return steps.reduce(function (result, step) {
    var args = replacePlaceholders(req, step.args);
    return result[step.method].apply(result, args);
  }, memo);
}