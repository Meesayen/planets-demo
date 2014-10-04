var $__Object$defineProperties = Object.defineProperties;
var $__Object$defineProperty = Object.defineProperty;
var $__Object$create = Object.create;
"use strict";

/*!
 * dom-handler.js 0.2.1
 * A simple dom handler class
 *
 * Copyright 2013, Federico Giovagnoli <mailto:gvg.fede@gmail.com>
 * Released under the MIT license
 */


var lookup = require("./utils.es6").lookup;

var renderSync = require("./tpl.es6").renderSync;
var renderContentSync = require("./tpl.es6").renderContentSync;
var EventEmitter = require("./eventemitter.es6")["default"];

var
	_slice = Array.prototype.slice;

exports["default"] = function($__super) {
    "use strict";

    function DomHandler() {
		this.__nodesApi = null;
		this.root = renderSync(this._template, this._model);

		// bindings cache, used to unbind event handlers during a 'clear' call.
		this._DomHandler_bindingsCache = {};

		this._DomHandler_manageBindings();
	}

    DomHandler.__proto__ = ($__super !== null ? $__super : Function.prototype);
    DomHandler.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(DomHandler.prototype, "constructor", {
        value: DomHandler
    });

    $__Object$defineProperties(DomHandler.prototype, {
        root: {
            get: function() {
                return this._root;
            },

            set: function(frag) {
                this._root = frag;
            },

            enumerable: true,
            configurable: true
        },

        nodes: {
            get: function() {
                var _this = this;
                return this.__nodesApi || (this.__nodesApi = {
                    one: function(selector) {
                        return _this._root.querySelector(selector);
                    },
                    every: function(selector, pureNodeList) {
                        if (pureNodeList === true) {
                            return _this._root.querySelectorAll(selector);
                        } else {
                            return _slice.call(_this._root.querySelectorAll(selector), 0);
                        }
                    },
                    add: function(element) {
                        _this._root.appendChild(element);
                    },
                    del: function(element) {
                        _this._root.removeChild(element);
                    },
                    clear: function() {
                        _this._root.innerHTML = '';
                    }
                });
            },

            enumerable: true,
            configurable: true
        },

        model: {
            get: function() {
                return this._model;
            },

            set: function(newModel) {
                this._model = newModel;
                this._DomHandler_refresh();
                this.refresh();
            },

            enumerable: true,
            configurable: true
        },

        refresh: {
            value: function() {
                // dummy, may be ovveridden to handle refreshing cycle
            },

            enumerable: false,
            writable: true
        },

        _DomHandler_manageBindings: {
            value: function() {
                var
                    boundElements = this.nodes.every('[data-on]'),
                    domEvent = '',
                    handlerPath = '',
                    handler = null,
                    dataOn = '',
                    bindings = null,
                    bindingParts;
                boundElements.forEach(function(el) {
                    dataOn = el.dataset.on;
                    bindings = dataOn.split(' ');
                    this._DomHandler_bindingsCache[dataOn] = [];
                    bindings.forEach(function(binding) {
                        bindingParts = binding.split(':');
                        domEvent = bindingParts[0];
                        handlerPath = bindingParts[1];

                        // TODO check destructuring now works within functions.
                        // [domEvent, handlerPath] = binding.split(':');

                        handler = function(_handlerPath, e) {
                            this._DomHandler_fire(_handlerPath, e);
                        }.bind(this, handlerPath);

                        // each bound html element should have a globally unique data-on value
                        this._DomHandler_bindingsCache[dataOn].push(handler);
                        el.addEventListener(domEvent, handler);
                    }.bind(this));
                }.bind(this));
            },

            enumerable: false,
            writable: true
        },

        _DomHandler_fire: {
            value: function(handlerPath, e) {
                var eventHandler = lookup(this.events, handlerPath);
                eventHandler && this[eventHandler].call(this, e);
            },

            enumerable: false,
            writable: true
        },

        _DomHandler_clear: {
            value: function() {
                var
                    bindings = this._DomHandler_bindingsCache,
                    el = null;
                Object.keys(bindings).forEach(function(k) {
                    el = this.nodes.one("[data-on=\"" + k + "\"]");
                    bindings[k].forEach(function(handler) {
                        return el.removeEventListener(handler);
                    });
                }.bind(this));
                var firstchild;
                while ((firstchild = this._root.firstChild)) {
                    this._root.removeChild(firstchild);
                }
            },

            enumerable: false,
            writable: true
        },

        _DomHandler_refresh: {
            value: function() {
                this._DomHandler_clear();
                var children = renderContentSync(this._template, this._model);
                this._root.appendChild(children);
                this._DomHandler_manageBindings();
            },

            enumerable: false,
            writable: true
        }
    });

    return DomHandler;
}(EventEmitter);