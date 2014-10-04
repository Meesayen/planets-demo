"use strict";
var Pretender = require("./lib/pretender.js").Pretender;
var serialize = require("../core/utils.es6").serialize;
var responses = require("./responses.es6")["default"];

var responseHandler = function(k, req) {
  var res = responses[k];
  if (req.queryParams.fails) {
    return [404, {
        'Content-Type': 'application/json'
      },
      serialize((res.failure && res.failure()) || 'Not found.')
    ];
  } else {
    return [200, {
        'Content-Type': 'application/json'
      },
      serialize((res.success && res.success()) || (res && res()))
    ];
  }
};

window.mockServer = new Pretender(function() {
  Object.keys(responses).forEach(function(k) {
    this.get(k, responseHandler.bind(this, k));
  }.bind(this));
});