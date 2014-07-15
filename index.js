(function () {
  'use strict';

  var _ = require('underscore');

  function getUndefinedParams(target, params) {
    if (!target || !params) {
      return null;
    }

    if (!Array.isArray(params)) {
      params = [params];
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
      var message;

      for (key in params) {
        if (params.hasOwnProperty(key)) {
          missing = getUndefinedParams(req[key], params[key]);

          if (missing) {
            message = options.message;

            if (typeof message === 'function') {
              message = message(missing);
            }

            res.send(400, message);
            return;
          }
        }
      }

      next();
    };
  };
})();
