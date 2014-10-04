"use strict";
/* global Text */

var render = require("./tpl.es6").render;
var renderSync = require("./tpl.es6").renderSync;
var renderString = require("./tpl.es6").renderString;
var renderStringSync = require("./tpl.es6").renderStringSync;

var stupidJshint;

// FIXME remove this hack when Handlebars will be removed from Karma.
window.R = window.R || window.Handlebars;

describe('tpl.es6: Templates helper', function() {

  beforeEach(function() {
    window["R"] = window["R"] || {};
    window["R"]["templates"] = window["R"]["templates"] || {};
    window["R"]["templates"]["vn2537948v523048v57m2384bn84357"] =
        window["Handlebars"].template(function (R,depth0,helpers,partials,data) {
      this.compilerInfo = [4,'>= 1.0.0'];
      helpers = this.merge(helpers, R.helpers); data = data || {};
      return "<div>\n  <p>Booking Form goes here</p>\n</div>\nWelcome here\n<ul>\n  <li>one</li>\n  <li>two</li>\n</ul>\n";
    });
  });

  describe('.render()', function() {
    it('should return a Promise instance', function() {
      var promise = render('vn2537948v523048v57m2384bn84357');
      expect(promise).to.be.an.instanceof(Promise);
    });
    it('should return a HTMLElement instance on Promise fulfillment', function(done) {
      render('vn2537948v523048v57m2384bn84357').then(function(frag) {
        expect(frag).to.be.an.instanceof(HTMLElement);
        done();
      });
    });
    it('should produce the correct node tree', function(done) {
      render('vn2537948v523048v57m2384bn84357').then(function(frag) {
        var node = frag;
        if (node.nodeType === 3) {
          node = node.nextSibling;
        }
        expect(node).to.be.an.instanceof(HTMLDivElement);
        stupidJshint = expect(node.querySelector('p')).to.be.ok;
        node = node.nextSibling;
        expect(node).to.be.an.instanceof(Text);
        node = node.nextSibling;
        if (node.nodeType === 3) {
          node = node.nextSibling;
        }
        expect(node).to.be.an.instanceof(HTMLUListElement);
        expect(node.querySelectorAll('li').length).to.be.equal(2);
        done();
      });
    });
  });

  describe('.renderSync()', function() {
    it('should return a HTMLElement instance', function() {
      var rendered = renderSync('vn2537948v523048v57m2384bn84357');
      expect(rendered).to.be.an.instanceof(HTMLElement);
    });
    it('should produce the correct node tree', function() {
      var
        rendered = renderSync('vn2537948v523048v57m2384bn84357'),
        node = rendered;
      if (node.nodeType === 3) {
        node = node.nextSibling;
      }
      expect(node).to.be.an.instanceof(HTMLDivElement);
      stupidJshint = expect(node.querySelector('p')).to.be.ok;
      node = node.nextSibling;
      expect(node).to.be.an.instanceof(Text);
      node = node.nextSibling;
      if (node.nodeType === 3) {
        node = node.nextSibling;
      }
      expect(node).to.be.an.instanceof(HTMLUListElement);
      expect(node.querySelectorAll('li').length).to.be.equal(2);
    });
  });

  describe('.renderString()', function() {
    it('should return a Promise', function() {
      var promise = renderString('vn2537948v523048v57m2384bn84357');
      expect(promise).to.be.an.instanceof(Promise);
    });
    it('should return a string upon Promise fulfillment', function() {
      renderString('vn2537948v523048v57m2384bn84357').then(function(templ) {
        expect(templ).to.be.a('string');
      });
    });
    it('should produce the correct node tree representation', function() {
      renderString('vn2537948v523048v57m2384bn84357').then(function(templ) {
        expect(templ).to.be.equal('<div>\n  <p>Booking Form goes here</p>\n' +
          '</div>\nWelcome here\n<ul>\n  <li>one</li>\n  <li>two</li>\n</ul>\n');
      });
    });
  });

  describe('.renderStringSync()', function() {
    it('should return a string', function() {
      var rendered = renderStringSync('vn2537948v523048v57m2384bn84357');
      expect(rendered).to.be.a('string');
    });
    it('should produce the correct node tree representation', function() {
      var rendered = renderStringSync('vn2537948v523048v57m2384bn84357');
      expect(rendered).to.be.equal('<div>\n  <p>Booking Form goes here</p>\n' +
        '</div>\nWelcome here\n<ul>\n  <li>one</li>\n  <li>two</li>\n</ul>\n');
    });
  });
});