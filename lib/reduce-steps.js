/**
 * TODO: document
 * @module lib/reduce-steps
 */
'use strict';

var replacePlaceholders = require('./replace-placeholders');

module.exports = reduceSteps;

function reduceSteps (req, memo, steps, callback) {
  return steps.reduce(function (result, step, i) {
    var args = replacePlaceholders(req, step.args);
    if (callback && i === steps.length - 1) {
      // last step should be given callback
      args.push(callback);
    }
    return result[step.method].apply(result, args);
  }, memo);
}
