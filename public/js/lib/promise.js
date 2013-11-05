/*!
 * Promise.js 0.8.0
 * A basic Promise implementation, with chain capabilities.
 *
 * Copyright 2013, Federico Giovagnoli <mailto:gvg.fede@gmail.com>
 * Released under the MIT license
 */

define([
	'lib/class'
],
function(
	Class
) {

	var _slice = Array.prototype.slice;

	var Promise = Class({
		parent: Object,
		constructor: function() {
			this._data = null;
			this._status = null;
			this._callbacks = [];
		},
		then: function(onComplete, onReject, onProgress) {
			var
				p = new Promise(),
				callback = null;
			if (this._data) {
				if (this._status === 'completed') {
					callback = onComplete;
				} else if (this._status === 'rejected') {
					callback = onReject;
				} else {
					callback = onProgress;
				}
				var f = callback(this._data);
				if (f) {
					f.then(
						p.complete,
						p.reject,
						p.progress
					);
				}
			} else {
				this._callbacks.push({
					'complete': onComplete,
					'reject': onReject,
					'progress': onProgress,
					'promise': p
				});
			}
			return p;
		},
		complete: function(data) {
			this._data = data;
			this._status = 'completed';
			this._trigger('complete');
		},
		reject: function(data) {
			this._data = data;
			this._status = 'rejected';
			this._trigger('reject');
		},
		progress: function(data) {
			this._data = data;
			this._status = 'progressing';
			this._trigger('progress');
		},
		_trigger: function(status) {
			for (var i = 0, cb; cb = this._callbacks[i]; i++) {
				if (cb[status]) {
					var
						f = cb[status](this._data),
						p = cb['promise'];
					if (f) {
						f.then(
							function() {p.complete.apply(p, _slice.call(arguments, 0))},
							function() {p.reject.apply(p, _slice.call(arguments, 0))},
							function() {p.progress.apply(p, _slice.call(arguments, 0))}
						);
					}
				}
			}
		}
	});

	return Promise;
});
