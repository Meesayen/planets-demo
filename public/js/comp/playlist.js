define([
	'lib/common',
	'lib/class',
	'lib/dom-handler'
], function(
	x,
	Class,
	DomHandler
) {

	var Playlist = Class({
		parent: DomHandler,
		constructor: function(o) {
			this._root = x.render('playlist', {
				tracks: []
			});
			this._items = this.nodes.every('.track');
		},
		accessors: {
			data: {
				get: function() {
					return this._data;
				},
				set: function(data) {
					this._data = data;
					this._refresh();
				}
			}
		},
		_refresh: function() {
			this._root.outerHTML = x.render('playlist', {
				tracks: this._data
			}, true)
		}
	});

	return Playlist;
});

