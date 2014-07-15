(function () {
  'use strict';

  var expect = require('chai').expect;
  var sinon = require('sinon');

  var parameters = require('../');


  describe('parameters-middleware', function () {
    it('is accessible', function () {
      expect(parameters).to.be.defined;
    });


    it('is a function', function () {
      expect(parameters).to.be.a('function');
    });


    it('throws an error if no params are specified', function () {
      function withoutParams() {
        parameters();
      }

      var message = 'Missconfigured: no required parameters set';
      expect(withoutParams).to.throw(message);
    });


    it('returns a middleware', function () {
      var middleware = parameters({
        query : ['foo', 'bar']
      });

      expect(middleware).to.be.a('function');
      expect(middleware).to.have.length(3);
    });


    describe('middleware', function () {
      var req;
      var res;
      var next;

      before(function () {
        req = {
          query : {
            foo : 'foobar',
            bar : 'barbaz'
          },
          body : {
            baz : 'bazfoo'
          },
          arbitrary : {
            woo : 'hoo'
          }
        };

        res = {
          send : sinon.spy()
        };

        next = sinon.spy();
      });


      beforeEach(function () {
        res.send.reset();
        next.reset();
      });


      it('calls the next middleware if all parameters are set', function () {
        var middleware = parameters({
          query : ['foo', 'bar'],
          body : ['baz']
        });

        middleware(req, res, next);

        expect(next).to.have.been.calledOnce;
      });


      it('works with single params passed as strings', function () {
        var middleware = parameters({
          query : 'foo',
          body : 'baz'
        });

        middleware(req, res, next);
        expect(next).to.have.been.calledOnce;
      });


      it('works with multiple params passed as an array', function () {
        var middleware = parameters({
          query : ['foo', 'bar']
        });

        middleware(req, res, next);
        expect(next).to.have.been.calledOnce;
      });


      it('does not call the next middleware if a param is missing',
        function () {
          var middleware = parameters({
            query : ['missing']
          });

          middleware(req, res, next);

          expect(next).not.to.have.been.called;
        });


      it('responds with a status 400 (bad request) if params are missing',
        function () {
          var middleware = parameters({
            query : ['missing']
          });

          middleware(req, res, next);
          expect(res.send).to.have.been.calledWith(400);
        });


      it('responds with a status 400 if the property is not set in the request',
        function () {
          var middleware = parameters({
            inexistent : 'param'
          });

          middleware(req, res, next);
          expect(res.send).to.have.been.calledWith(400);
        });


      it('uses the configured message', function () {
        var params = {
          query : ['missing']
        };

        var options = {
          message : 'Custom message'
        };

        var middleware = parameters(params, options);

        middleware(req, res, next);

        var message = res.send.lastCall.args[1];
        expect(message).to.equal(options.message);
      });


      it('allows to use a message function', function () {
        var params = {
          query : ['missing']
        };

        var options = {
          message : function (missing) {
            return 'Missing params: ' + missing.join(', ');
          }
        };

        var middleware = parameters(params, options);

        middleware(req, res, next);

        var message = res.send.lastCall.args[1];
        var expected = 'Missing params: missing';
        expect(message).to.equal(expected);
      });


      it('checks arbitrary properties in the request', function () {
        var params = {
          // Usually, there's no 'arbitrary' property in the request object
          arbitrary : ['woo']
        };

        var middleware = parameters(params);

        middleware(req, res, next);
        expect(next).to.have.been.called;
      });


      it('respects the property in which each param should be found',
        function () {
          var params = {
            // The request has 'foo' in the query and 'bar' in the body,
            // this should fail...
            query : ['bar'],
            body : ['foo']
          };

          var middleware = parameters(params);

          middleware(req, res, next);
          expect(next).not.to.have.been.called;
          expect(res.send).to.have.been.called;
        });
    }); // middleware
  }); // parameters-middleware
})();
