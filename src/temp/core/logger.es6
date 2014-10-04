var $__Object$defineProperties = Object.defineProperties;
"use strict";

/*!
 * logger.js 1.1.0
 * Polyfunctional logger class. Its main purpose is to push logs to its
 * companion, Sentinel, a web console written on top of node.js,
 * distributed under the MIT license.
 *
 * Copyright 2013, Federico Giovagnoli <mailto:gvg.fede@gmail.com>
 * Released under the MIT license
 */

var device = require("./utils.es6").device;

var
  __LoggerStaticFinalInstances__ = {},
  UA = device.userAgent,
  slice = Array.prototype.slice,
  toCamelCase = function(string) {
    return string
      .split('-')
      .reduce(function(curr, next) {
      return curr + String.fromCharCode(
            next.charCodeAt(0) - 32) + next.slice(1);
    });
  };

var Logger = function() {
  "use strict";

  function Logger(name, opts) {
    if (name && typeof name !== 'string') {
      opts = name;
      name = 'global';
    }
    if (__LoggerStaticFinalInstances__[name] === undefined) {
      __LoggerStaticFinalInstances__[name] = this._createInstance(name, opts);
    }
    return __LoggerStaticFinalInstances__[name];
  }

  $__Object$defineProperties(Logger.prototype, {
    log: {
      value: function() {
        var $__arguments0 = arguments;
        var $__arguments = $__arguments0;
        this._write('[INFO]', 'info', slice.call($__arguments, 0));
      },

      enumerable: false,
      writable: true
    },

    info: {
      value: function() {
        var $__arguments1 = arguments;
        var $__arguments = $__arguments1;
        this._write('[INFO]', 'info', slice.call($__arguments, 0));
      },

      enumerable: false,
      writable: true
    },

    warn: {
      value: function() {
        var $__arguments2 = arguments;
        var $__arguments = $__arguments2;
        this._write('[WARNING]', 'warning', slice.call($__arguments, 0));
      },

      enumerable: false,
      writable: true
    },

    err: {
      value: function() {
        var $__arguments3 = arguments;
        var $__arguments = $__arguments3;
        this._write('[ERROR]', 'error', slice.call($__arguments, 0));
      },

      enumerable: false,
      writable: true
    },

    addUser: {
      value: function(user) {
        if (user.indexOf('-') > -1) {
          try {
            user = toCamelCase(user);
          } catch(e) {}
        }
        Object.defineProperty(this, user, {
          get: function() {
            this._tmpUser = user;
            return this;
          },
          set: function() {},
          enumerable: true,
          configurable: true
        });
      },

      enumerable: false,
      writable: true
    },

    _createInstance: {
      value: function() {
        var name = (arguments[0] !== void 0 ? arguments[0] : 'global');
        var opts = (arguments[1] !== void 0 ? arguments[1] : {});
        this._channel = name;
        this._user = opts.user || 'global';
        this._tmpUser = null;
        this._url = (opts.url || 'http://localhost:1337') + '/log';
        this._write = this._xhrWrite;

        if (opts && opts.forceXhr !== true) {
          if (UA.indexOf('Chrome') > -1) {
            this._write = this._consoleWrite;
          }
        }

        return this;
      },

      enumerable: false,
      writable: true
    },

    _xhrWrite: {
      value: function(label, type, chunks) {
        var user = this._user;
        if (this._tmpUser) {
          user = this._tmpUser;
          this._tmpUser = null;
        }
        var
          xhr = new XMLHttpRequest(),
          params = this._serialize({
            'app': this._channel,
            'time': new Date().getTime(),
            'label': label,
            'chunks': chunks,
            'type': type,
            'user': user
          });
    
        xhr.open('POST', this._url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(params);
      },

      enumerable: false,
      writable: true
    },

    _consoleWrite: {
      value: function(label, type, chunks) {
        var user = this._user;
        if (this._tmpUser) {
          user = this._tmpUser;
          this._tmpUser = null;
        }
        chunks.unshift(label.slice(0, label.length - 1) + ':' + user + ']');
        console.log.apply(console, chunks);
      },

      enumerable: false,
      writable: true
    },

    _serialize: {
      value: function(object) {
        return JSON.stringify(object, function(k, v) {
          if (v instanceof HTMLElement) {
            return '[HTMLElement]';
          } else {
            return v;
          }
        });
      },

      enumerable: false,
      writable: true
    }
  });

  return Logger;
}();

var _log = (function() {
  var
    forceXhr = true,
    name = 'global',
    eTitle = document.querySelector('head title');
  if (device.isMobile) {
    forceXhr = true;
  }
  if (eTitle && eTitle.innerHTML) {
    name = eTitle.innerHTML.replace(/\W*/g, '');
  }
  return new Logger(name, {
    forceXhr: forceXhr
  });
})();

var getLogger = function() {
  return _log;
};

exports.getLogger = getLogger;

var setLogger = function(name, o) {
  return (_log = new Logger(name, o));
};

exports.setLogger = setLogger;