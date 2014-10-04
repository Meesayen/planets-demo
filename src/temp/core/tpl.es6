"use strict";
/* global R */
/* global dust */

var
  doc = document,
  tmpDiv = doc.createElement('div');


var renderString = function(key, data) {
  return new Promise(function(resolve, reject) {
    if (window['dust']) {
      dust.render(key, data || {}, function(err, tpl) {
        if (err) {
          reject(err);
        } else {
          resolve(tpl);
        }
      });
    } else {
      resolve(R.templates[key](data || {}));
    }
  });
};
exports.renderString = renderString;
var renderStringSync = function(key, data) {
  if (window['dust']) {
    console.warn('You must use the asynchronous method `renderString` to take' +
        ' advantage of Dust templates.');
    return '';
  }
  return R.templates[key](data || {});
};
exports.renderStringSync = renderStringSync;

var render = function(key, data, multi) {
  var
    frag = doc.createDocumentFragment(),
    el;
  return new Promise(function(resolve, reject) {
    new Promise(function(resolve, reject) {
      renderString(key, data).then(resolve, reject);
    }).then(function(tpl) {
      tmpDiv.innerHTML = tpl;
      while ((el = tmpDiv.firstChild)) {
        frag.appendChild(el);
      }
      resolve(multi ? frag : frag.firstChild);
    }, function(err) {
      reject(err);
    });
  });
};
exports.render = render;
var renderSync = function(key, data, multi) {
  var
    frag = doc.createDocumentFragment(),
    el;
  tmpDiv.innerHTML = renderStringSync(key, data);
  while ((el = tmpDiv.firstChild)) {
    frag.appendChild(el);
  }
  return multi ? frag : frag.firstChild;
};
exports.renderSync = renderSync;
var get = function(key) {
  return R.templates[key];
};
exports.get = get;
var renderContent = function(key, data) {
  return new Promise(function(resolve, reject) {
    var contentFrag = document.createDocumentFragment();
    render(key, data).then(function(frag) {
      var el;
      while ((el = frag.firstChild)) {
        contentFrag.appendChild(el);
      }
      resolve(contentFrag);
    })['catch'](reject);
  });
};
exports.renderContent = renderContent;var renderContentSync = function(key, data) {
  var
    frag = renderSync(key, data),
    contentFrag = document.createDocumentFragment(),
    el;
  while ((el = frag.firstChild)) {
    contentFrag.appendChild(el);
  }
  return contentFrag;
};
exports.renderContentSync = renderContentSync;
// Little trick until es6-module-transpiler would support the new syntax:
// import { * as moduleName } from './moduleName';
exports["default"] = {
  render: render,
  renderSync: renderSync,
  renderString: renderString,
  renderStringSync: renderStringSync,
  renderContent: renderContent,
  renderContentSync: renderContentSync,
  get: get
};