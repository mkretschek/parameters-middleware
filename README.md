parameters-middleware
=====================

[![NPM version](https://badge.fury.io/js/parameters-middleware.svg)](http://badge.fury.io/js/parameters-middleware)
[![Build Status](https://travis-ci.org/mkretschek/parameters-middleware.svg?branch=master)](https://travis-ci.org/mkretschek/parameters-middleware)
[![Coverage Status](https://coveralls.io/repos/mkretschek/parameters-middleware/badge.png)](https://coveralls.io/r/mkretschek/parameters-middleware)
[![Code Climate](https://codeclimate.com/github/mkretschek/parameters-middleware.png)](https://codeclimate.com/github/mkretschek/parameters-middleware)

A middleware for express that checks if the required parameters are set
in the request.

Note that this middleware only checks if the parameters are defined in the
expected object. It **DOES NOT** validate the values.


Usage
-----

```
npm install parameters-middleware
```

In your route definitions:

```js

var express = require('express');
var parameters = require('parameters-middleware');

var app = express();

// Commonly used requirements can be defined only once and re-used
// throughout your code.
var requireToken = parameters({header : 'token'});

app
  .get('/user', requireToken, function (req, res) {
    // `req.header.token` is set
    getUser(req.header.token);
  })

  .get('/search', parameters({query : 'q'}), function (req, res) {
    // `req.query.q` is set
    search(req.query.q);
  })

  .post('/blog', parameters({
    header : 'token',
    body : ['title', 'content', 'tags']
  }), function (req, res) {
    // `req.header.token` is set
    // `req.body.title`, `req.body.content` and `req.body.tags` are set
    createPost();
  });

```


Options
-------

The `parameters-middleware` allows you to pass an options object as its
second argument.


### `statusCode`

By default, the `parameters-middleware` sends a response with status code
`400 Bad Request` if any parameter is missing, but you can change it with
the `statusCode` option:

```js
// Responds with `404 Not Found` if the `q` param is not defined in the
// request's query.
app.get(
  '/search',
  parameters({query : 'q'}, {statusCode : 404}),
  function (req, res) {
    // `req.query.q` is set
    search(req.query.q);
  }
);
```


### `message`

By default, a default message will be set depending on the configured status
code sent by the response (`Bad Request` for status code `400`, `Not Found` for
status code `404`, and so on).

If you wish to change this, use the `message` option.

```js
app.post(
  '/blog',
  parameters(
    {header : 'token'},
    // Setting a custom message
    {message : 'Missing token'}
  ),
  function (req, res) {
    // `req.header.token` is surelly set here
    createBlogPost();
  }
);
```

The `message` option also accepts a function, which receives an array
containing the missing parameters and should return a message string.

```js
function getMessage(missing) {
  return 'Missing params: ' + missing.join(', ');
}

app.post(
  '/blog',
  parameters(
    {body : ['title', 'content', 'tags']},
    {message : getMessage}
  ),
  function (req, res) {
    // `req.body.title`, `req.body.content` and `req.body.tags` are set
    createBlogPost();
  }
);
```


License
-------

This project is distributed under the MIT license. See the `LICENSE` file for
more details.
