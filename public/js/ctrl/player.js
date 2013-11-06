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
			this._source = document.createElement('source')
			this._root.appendChild(this._source);
			this._root.addEventListener('loadeddata', this._sourceLoaded.bind(this));
			this._root.addEventListener('ended', this._playbackEnded.bind(this));
			this._root.addEventListener('pause', this._playbackPaused.bind(this));
			this._root.addEventListener('timeupdate', this._playbackTimeupdate.bind(this));
			// this._root.addEventListener('suspend', this._playbackSuspended.bind(this));
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
			this._source.src = url;
			this._root.load();
		},
		_sourceLoaded: function() {
			this._loaded = true;
			this.emit('audio:ready');
		},
		_playbackEnded: function() {
			this.emit('audio:ended');
		},
		// _playbackSuspended: function() {
		// 	console.log('suspended');
		// },
		// _playbackAborted: function() {
		// 	console.log('aborted');
		// },
		_playbackTimeupdate: function(e) {
			if (this._root.duration && this._root.duration - 1 < this._root.currentTime) {
				this._playbackEnded();
			}
		},
		_playbackPaused: function() {
			this.emit('audio:paused');
		}
	});

	return Player;
});
