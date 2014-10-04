"use strict";
var randomList = require("./utils.es6").randomList;
var fakeCompany = require("../lib/faker.js").company;

var testing = {
  success: function() {
    return {
      message: 'Hey Dude, fucking A, it is working!',
      deeply: {
        nested: {
          key: 'wonderful'
        }
      }
    };
  },
  failure: function() {
    return {
      message: 'Oh no, man, I am sorry. It looks broken.'
    };
  }
};
exports.testing = testing;
var one = function() {
  return {
    greetings: 'ciao'
  };
};
exports.one = one;
var last = {
  success: function() {
    return {
      message: 'Yes, it is really wonderful stuff.'
    };
  },
  failure: function() {
    return {
      message: 'Broken!'
    };
  }
};
exports.last = last;
var awesomeList = {
  success: function() {
    return {
      title: fakeCompany.companyName(),
      items: randomList(10, function() {
        return {
          label: fakeCompany.catchPhrase()
        };
      })
    };
  },
  failure: function() {
    return {
      message: 'Broken!'
    };
  }
};
exports.awesomeList = awesomeList;
// Little trick until es6-module-transpiler would support the new syntax:
// import { * as moduleName } from './moduleName';
exports["default"] = {
  testing: testing,
  one: one,
  last: last,
  awesomeList: awesomeList
};