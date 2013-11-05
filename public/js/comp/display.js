define([
	'lib/common',
	'lib/class',
	'lib/dom-handler'
], function(
	x,
	Class,
	DomHandler
) {

	var Display = Class({
		parent: DomHandler,
		constructor: function(o) {
			this._root = x.render('display', { track: {}});
			this._infoBox = this.nodes.one('.track-info');
			this._opened = false;
			this._thumb = this.nodes.one('.thumb');
			this._thumb.addEventListener('click', this._onThumbClick.bind(this));
			this._trhickBtn = this.nodes.one('.trick-btn');
			this._trhickBtn.addEventListener('click', this._onTrickBtnClick.bind(this));
		},
		statics: {
			TRICK_PLAY: 1,
			TRICK_PAUSE: 2,
			TRICK_LOADING: 4
		},
		accessors: {
			data: {
				get: function() {
					return this._data;
				},
				set: function(data) {
					this._data = data;
					this.refresh();
				}
			}
		},
		setTrick: function(flag) {
			if (flag & Display.TRICK_LOADING) {
				this._trhickBtn.classList.remove('pause');
				this._trhickBtn.classList.remove('play');
				this._trhickBtn.classList.add('loading');
			} else if (flag & Display.TRICK_PAUSE) {
				this._trhickBtn.classList.remove('loading');
				this._trhickBtn.classList.remove('play');
				this._trhickBtn.classList.add('pause');
			} else {
				this._trhickBtn.classList.remove('loading');
				this._trhickBtn.classList.remove('pause');
				this._trhickBtn.classList.add('play');
			}
		},
		refresh: function() {
			this._infoBox.innerHTML = '';
			this._infoBox.appendChild(x.render('track-info', {
				track: this._data
			}));
			if (this._data.playing) {
				this.setTrick(Display.TRICK_PAUSE);
			} else {
				this.setTrick(Display.TRICK_PLAY);
			}
		},
		_onTrickBtnClick: function() {
			this.emit('display:trick');
		},
		_onThumbClick: function() {
			this._opened = !this._opened;
			if (this._opened) {
				this.emit('display:open');
				this._thumb.classList.remove('list-up');
				this._thumb.classList.add('icon-remove');
			} else {
				this.emit('display:close');
				this._thumb.classList.add('list-up');
				this._thumb.classList.remove('icon-remove');
			}
		}
	});

	return Display;
});
