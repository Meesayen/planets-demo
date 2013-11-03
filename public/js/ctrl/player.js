define([
	'lib/common',
	'lib/class',
	'lib/eventemitter'
], function(
	x,
	Class,
	EventEmitter
) {


	var Player = Class({
		parent: EventEmitter,
		constructor: function(o) {
			this._root = document.createElement('audio');
			this._root.addEventListener('loadeddata', this._sourceLoaded.bind(this));
			this._root.addEventListener('ended', this._playbackEnded.bind(this));
			this._root.addEventListener('pause', this._playbackPaused.bind(this));
			this._root.addEventListener('abort', this._playbackPaused.bind(this));
			this._root.addEventListener('suspend', this._playbackPaused.bind(this));
		},
		play: function(start) {
			if (this._loaded) {
				this._root.play();
				this.emit('audio:playing');
			}
		},
		pause: function() {
			if (this._loaded) {
				this._root.pause();
			}
		},
		load: function(url) {
			this.emit('audio:loading');
			this._loaded = false;
			this._root.src = url;
		},
		_sourceLoaded: function() {
			this._loaded = true;
			this.emit('audio:ready');
		},
		_playbackEnded: function() {
			this.emit('audio:ended');
		},
		_playbackPaused: function() {
			this.emit('audio:paused');
		}
	});

	return Player;
});
