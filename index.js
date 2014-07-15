(function () {
  'use strict';

  var _ = require('underscore');

  function getUndefinedParams(target, params) {
    if (!params) {
      return null;
    }

    if (!Array.isArray(params)) {
      params = [params];
    }

    if (!target) {
      return params;
    }

    var missing = _.filter(params, function (param) {
      return _.isUndefined(target[param]);
    });

    return missing.length && missing || null;
  }


  exports = module.exports = function (params, options) {
    if (!params) {
      throw(new Error('Missconfigured: no required parameters set'));
    }

    options = options || {};

    return function (req, res, next) {
      var key;
      var missing;
      var message = options.message;
      // Default to status 400 Bad Request
      var statusCode = options.statusCode || 400;

      for (key in params) {
        if (params.hasOwnProperty(key)) {
          missing = getUndefinedParams(req[key], params[key]);

          if (missing) {
            if (typeof message === 'function') {
              message = message(missing);
            }

            res.send(statusCode, message);
            return;
          }
        }
      }

      next();
    };
  };
})();
