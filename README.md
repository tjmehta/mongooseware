mongooseware
============
[![Build Status](https://travis-ci.org/tjmehta/mongooseware.png?branch=master)](https://travis-ci.org/tjmehta/mongooseware)
[![Code Climate](https://codeclimate.com/github/tjmehta/mongooseware/badges/gpa.svg)](https://codeclimate.com/github/tjmehta/mongooseware)
[![Test Coverage](https://codeclimate.com/github/tjmehta/mongooseware/badges/coverage.svg)](https://codeclimate.com/github/tjmehta/mongooseware)
[![Dependency Status](https://david-dm.org/tjmehta/mongooseware.svg)](https://david-dm.org/tjmehta/mongooseware)
[![devDependency Status](https://david-dm.org/tjmehta/mongooseware/dev-status.svg)](https://david-dm.org/tjmehta/mongooseware#info=devDependencies)

[![NPM](https://nodei.co/npm/mongooseware.png?compact=true)](https://nodei.co/npm/mongooseware/)

Magic mongoose middleware for express  
Works great with [tjmehta/dat-middleware](https://github.com/tjmehta/dat-middleware)

# Installation
```bash
npm install mongooseware
```

# Examples

- Model class methods
```js
var mw = require('dat-middleware');
var BlogModel = require('mongoose').model('blogs', BlogSchema);
var blogs = require('mongooseware')(BlogModel);
var app = require('express')();

app.post('blogs',
  mw.body('name').require().string().pick(),
  blogs.create('body'),
  mw.res.send('blog'));

app.get('blogs',
  mw.query('name').require().string().pick()
  blogs.find('query'),
  mw.res.send('blogs'));

app.get('blogs/:blogId',
  blogs.findOne({ _id: 'params.blogId' }),
  mw.req('blog').require()
    .else(
      mw.res.next(mw.Boom.notFound('Blog not found'))
    ),
  mw.res.send('blog'));
```

- Model instance methods
```js
var mw = require('dat-middleware');
var BlogModel = require('mongoose').model('blogs', BlogSchema);
var blogs = require('mongooseware')(BlogModel);
var app = require('express')();

app.patch('blogs/:blogId',
  blogs.findOne({ _id: 'params.blogId' }),
  mw.req('blog').require()
    .else(
      mw.res.next(mw.Boom.notFound('Blog not found'))
    ),
  mw.body('name').require().string().pick(),
  blogs.model.update({
    $set: 'body'
  }),
  mw.res.send('blog'));
```

## method-chain.exec([reqKey])
Specify the key to which an async method's results should be saved to on req

## method-chain.sync([reqKey])
Specify the key to which an sync method's return value should be saved to on req

# License
### MIT
