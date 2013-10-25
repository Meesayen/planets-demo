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
				tracks: [{
					title: 'Mouthful of Diamonds',
					artist: 'Phantogram',
					album: 'Eyelid Movies',
					year: '2010'
				}, {
					title: 'Bethos',
					artist: 'Gifts From Enola',
					album: 'From Fathom',
					year: '2009'
				}, {
					title: 'Odyssey Rescue',
					artist: 'M83',
					album: 'Oblivion EP',
					year: '2013'
				}, {
					title: 'Scar',
					artist: 'Cloud Control',
					album: 'Dream Cave',
					year: '2013'
				}, {
					title: 'Beat The System',
					artist: '501',
					album: 'Beat The System EP',
					year: '2013'
				}]
			});
			this._items = this.nodes.every('.track');
		}
	});

	return Playlist;
});

