"use strict";
/**
 * Safe Object serializer. It won't fail if undefined or null is passed, but
 * returns an empty object representation.
 *
 * @params {Object} obj
 * @return {String} A string representation of the Object passed in.
 */
var serialize = function(obj) {
  return JSON.stringify(obj || {});
};
exports.serialize = serialize;
/**
 * Safe Object representation deserializer. It won't fail if undefined or null
 * is passed, but returns an empty object. It will still fail if a malformed
 * Object representation is given as the input.
 *
 * @params {String} str: Object representation string.
 * @return {Object} The deserialized Object.
 */
var deserialize = function(str) {
  return JSON.parse(str || '{}');
};
exports.deserialize = deserialize;
/**
 * Simple deep object copy function.
 *
 * @params {Object} obj: The Object to be cloned.
 * @return {Object} Deep clone of the input Object.
 */
var clone = function(obj) {
  return deserialize(serialize(obj));
};
exports.clone = clone;
/**
 * Object value lookup. It takes an Object and a String descriptive of the path
 * to traverse to reach the desired value.
 * i.e.
 * obj = {
 *  deep: {
 *   nested: {
 *    value: 42
 *   }
 *  }
 * }
 * path = 'deep.nested.value'
 *
 * @param  {Object} data The object in which the lookup should be performed
 * @param  {String} key The string descriptive of the value path
 * @return {Value || undefined}
 */
var lookup = function(data, key) {
  return key.split('.').reduce(function(obj, keyBit) {
    if (typeof obj === 'object') {
      return obj[keyBit];
    }
    return undefined;
  }, data);
};
exports.lookup = lookup;

var run = function(g, cb) {
  var
    it = g(),
    ret;
  (function iterate(val) {
    ret = it.next(val);
    if (!ret.done) {
      if ('then' in ret.value) {
        ret.value.then(iterate, function(err) {
          cb(err, val);
        });
      } else {
        setTimeout(function() {
          iterate(ret.value);
        }, 0);
      }
    } else {
      cb(null, val);
    }
  })();
};

/**
 * Generator runner which returns a Promise to work with.
 *
 * @param  {Generator} gen
 * @return {Promise}
 */
var async = function(gen) {
  return new Promise(function(resolve, reject) {
    run(gen, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
exports.async = async;
var UA = navigator.userAgent;
var device = {
  userAgent: UA,
  isIE: (UA.indexOf('MSIE') > -1),
  isChromeMobile: (UA.indexOf('Android') > -1 && UA.indexOf('Chrome') > -1),
  isIOS: (UA.indexOf('iPhone') > -1 || UA.indexOf('iPad') > -1),
  isMobile: (UA.indexOf('Android') > -1 ||
    UA.indexOf('iPhone') > -1 ||
    UA.indexOf('iPad') > -1)
};
exports.device = device;

var parseHref = function() {
  // TODO regexp check
  return window.location.href.split('?')[1].split('&').map(function(item) {
    var parts = item.split('=');
    var param = {};
    param[parts[0]] = parts[1];
    return param;
  }).reduce(function(cur, next) {
    for (var k in next) {
      cur[k] = next[k];
    }
    return cur;
  });
};
exports.parseHref = parseHref;

var forceRepaint = function(element) {
  element.style.display = 'none';
  element.offsetHeight;
  element.style.display = '';
};
exports.forceRepaint = forceRepaint;
var extend = function(obj, other) {
  for (var k in other) {
    obj[k] = other[k];
  }
};
exports.extend = extend;

var
  ss = window.sessionStorage,
  ls = window.localStorage;

var cache = {
  set: function(key, value) {
    ls.setItem(key, value);
  },
  get: function(key) {
    return ls.getItem(key);
  },
  del: function(key) {
    ls.removeItem(key);
  }
};
exports.cache = cache;
var session = {
  set: function(key, value) {
    ss.setItem(key, value);
  },
  get: function(key) {
    return ss.getItem(key);
  },
  del: function(key) {
    ss.removeItem(key);
  }
};
exports.session = session;