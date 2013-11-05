/**
	A collection of useful polyfills and shims.
	Maintainer: Federico Giovagnoli <mailto:gvg.fede@gmail.com>
*/


/* requestAnimationFrame shim */
window.rAF = (function() {
	return window.requestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.oRequestAnimationFrame
		|| window.msRequestAnimationFrame
		|| function(callback){
				window.setTimeout(callback, 1000 / 60);
			};
})();


/* Array.prototype.reduce polyfill */
if ('function' !== typeof Array.prototype.reduce) {
	Array.prototype.reduce = function(callback, opt_initialValue){
		'use strict';
		if (null === this || 'undefined' === typeof this) {
			// At the moment all modern browsers, that support strict mode, have
			// native implementation of Array.prototype.reduce. For instance, IE8
			// does not support strict mode, so this check is actually useless.
			throw new TypeError(
					'Array.prototype.reduce called on null or undefined');
		}
		if ('function' !== typeof callback) {
			throw new TypeError(callback + ' is not a function');
		}
		var index, value,
				length = this.length >>> 0,
				isValueSet = false;
		if (1 < arguments.length) {
			value = opt_initialValue;
			isValueSet = true;
		}
		for (index = 0; length > index; ++index) {
			if (this.hasOwnProperty(index)) {
				if (isValueSet) {
					value = callback(value, this[index], index, this);
				}
				else {
					value = this[index];
					isValueSet = true;
				}
			}
		}
		if (!isValueSet) {
			throw new TypeError('Reduce of empty array with no initial value');
		}
		return value;
	};
}

/* Array.prototype.map polyfill */
if ('function' !== typeof Array.prototype.map) {
	Array.prototype.map = function(callback, thisArg) {
		var T, A, k;
		if (this == null) {
			throw new TypeError(" this is null or not defined");
		}
		var O = Object(this);
		var len = O.length >>> 0;
		if (typeof callback !== "function") {
			throw new TypeError(callback + " is not a function");
		}
		if (thisArg) {
			T = thisArg;
		}
		A = new Array(len);
		k = 0;
		while(k < len) {

			var kValue, mappedValue;
			if (k in O) {
				kValue = O[ k ];
				mappedValue = callback.call(T, kValue, k, O);
				A[ k ] = mappedValue;
			}
			k++;
		}
		return A;
	};
}

/* Function.prototype.bind polyfill */
if ('function' !== typeof Function.prototype.bind) {
	Function.prototype.bind = function (oThis) {
		if (typeof this !== "function") {
			throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(
					this instanceof fNOP && oThis ? this : oThis,
					aArgs.concat(Array.prototype.slice.call(arguments))
				);
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();

		return fBound;
  };
}
