"use strict";
var helpers = require("../lib/faker.js").helpers;

var fill = function(n, l) {
  while (n > 0) {
    n--;
    l.push(true);
  }
  return l;
};

var list = function(n, produce) {
  var l = fill(n, []);
  return l.map(produce);
};
exports.list = list;
var randomList = function(n, produce) {
  var l = fill(helpers.randomNumber(n), []);
  return l.map(produce);
};
exports.randomList = randomList;