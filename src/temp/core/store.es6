var $__Object$defineProperties = Object.defineProperties;
"use strict";

/* global reqwest */
var registry = require("./storeRegistry.es6")["default"];

var serialize = require("./utils.es6").serialize;
var clone = require("./utils.es6").clone;
var lookup = require("./utils.es6").lookup;
var async = require("./utils.es6").async;
var req = reqwest;

var extendProps = function(props) {
  var data = (arguments[1] !== void 0 ? arguments[1] : {});

  if (!props.data) {
    props.data = {};
  }

  Object.keys(data).forEach(function(k) {
    if (k[0] === ':') {
      props.url = props.url.replace(k, data[k]);
    } else {
      props.data[k] = data[k];
    }
  });
};

// mockServer noop for production environment
var _mockServer = window['mockServer'] || {
  shutdown: function() {},
  restart: function() {}
};

var Store = function() {
  "use strict";

  function Store() {
    this._cache = {};
  }

  $__Object$defineProperties(Store.prototype, {
    get: {
      value: function(id, data) {
        var opts = (arguments[2] !== void 0 ? arguments[2] : {});

        var
          cache = this._cache,
          regProps = clone(registry[id]),
          mapProps = null,
          comboData = null,
          cacheId = data ? id + serialize(data) : id,
          comboProps;

        if (cache[cacheId] && !regProps.nocache && !opts.nocache) {
          return cache[cacheId];
        }

        if (regProps instanceof Array) {
          cache[cacheId] = async(regeneratorRuntime.mark(function asyncGetCombo() {
            var k;

            return regeneratorRuntime.wrap(function asyncGetCombo$(context$3$0) {
              while (1) switch (context$3$0.prev = context$3$0.next) {
              case 0:
                context$3$0.prev = 0;
              case 1:
                if (!(comboProps = regProps.shift())) {
                  context$3$0.next = 14;
                  break;
                }

                mapProps = comboProps.map || null;

                if (comboProps.id) {
                  comboProps = registry[comboProps.id];
                }

                if (mapProps !== null) {
                  for (k in mapProps) {
                    if (mapProps.hasOwnProperty(k)) {
                      comboProps.data[mapProps[k]] = lookup(comboData, k);
                    }
                  }
                }

                mapProps = null;
                extendProps(comboProps, data);

                if (comboProps.real || opts.real) {
                  _mockServer.shutdown();
                }

                context$3$0.next = 10;
                return req(comboProps);
              case 10:
                comboData = context$3$0.sent;
                _mockServer.restart();
                context$3$0.next = 1;
                break;
              case 14:
                return context$3$0.abrupt("return", comboData);
              case 17:
                context$3$0.prev = 17;
                context$3$0.t0 = context$3$0['catch'](0);
                throw context$3$0.t0;
              case 20:
              case "end":
                return context$3$0.stop();
              }
            }, asyncGetCombo, this, [[0, 17]]);
          }));
        } else {
          cache[cacheId] = async(regeneratorRuntime.mark(function asyncGet() {
            var res;

            return regeneratorRuntime.wrap(function asyncGet$(context$3$0) {
              while (1) switch (context$3$0.prev = context$3$0.next) {
              case 0:
                context$3$0.prev = 0;
                extendProps(regProps, data);

                if (regProps.real || opts.real) {
                  _mockServer.shutdown();
                }

                context$3$0.next = 5;
                return req(regProps);
              case 5:
                res = context$3$0.sent;
                _mockServer.restart();
                return context$3$0.abrupt("return", res);
              case 10:
                context$3$0.prev = 10;
                context$3$0.t1 = context$3$0['catch'](0);
                throw context$3$0.t1;
              case 13:
              case "end":
                return context$3$0.stop();
              }
            }, asyncGet, this, [[0, 10]]);
          }));
        }

        return cache[cacheId];
      },

      enumerable: false,
      writable: true
    },

    post: {
      value: function(id, data) {
        // TODO
        console.log(id, data);
      },

      enumerable: false,
      writable: true
    }
  });

  return Store;
}();

/**
 * An instance of Store will be exported, to make sure it will be a Singleton
 * everytime it is required as a dependency.
 */
var store = new Store();

exports["default"] = store;