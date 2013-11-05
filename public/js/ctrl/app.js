/*!
 * Planets 1.0.1
 * A simple handler function which makes easy the creation and
 * extension of classes.
 *
 * Copyright 2013, Federico Giovagnoli <mailto:gvg.fede@gmail.com>
 *	Designed by Francesco Mastrogiacomo (niftygift)
 * Released under the MIT license
 */

define([
	'lib/common',
	'lib/class',
	'lib/dom-handler',
	'lib/logger',

	'ctrl/network',
	'ctrl/player',

	'comp/display',
	'comp/playlist',
	'comp/planet-scroller'
], function(
	x,
	Class,
	DomHandler,
	Logger,

	network,
	Player,

	Display,
	Playlist,
	PlanetScroller
) {

	window.say = new Logger('Planets', {
		url: 'http://192.168.4.165:1337',
		forceXhr: true
	});

	var
		MOBILE = x.device.isMobile,
		BLURRED_CANVAS_SIZE = MOBILE ? screen.availWidth * 2 : 640,
		blurWorker = new Worker('js/workers/blur-worker.js');

	var
		PLAYER_PLAYING = 1,
		PLAYER_PAUSED = 2;


	var AppController = Class({
		parent: DomHandler,
		constructor: function() {
			this._root = document.body;
			if (!MOBILE) {
				this._root.classList.add('web-demo');
			}

			this._selectedTrackIndex = null;
			this._playingTrackIndex = null;

			this._playbackStatus = PLAYER_PAUSED;
			this._player = new Player();
			this._player.on('audio:loading', this._onPlayerLoading.bind(this));
			this._player.on('audio:ready', this._onPlayerReady.bind(this));
			this._player.on('audio:playing', this._onPlayerPlaying.bind(this));
			this._player.on('audio:paused', this._onPlayerPaused.bind(this));
			this._player.on('audio:ended', this._onPlayerEnded.bind(this));

			blurWorker.onmessage = this._onBlurWorkerComplete.bind(this);
			this._label = this.nodes.one('.header .label');
			this._offscreenCanvas = this.nodes.one('#background-offscreen-canvas');
			this._offscreenCtx = this._offscreenCanvas.getContext('2d');
			var blurredCanvas = this.nodes.one('.blurred-bg');
			this._offscreenCanvas.width = blurredCanvas.width = BLURRED_CANVAS_SIZE;
			this._offscreenCanvas.height = blurredCanvas.height = BLURRED_CANVAS_SIZE;
			this._blurredCtx = blurredCanvas.getContext('2d');
			this._blurredTop = this.nodes.one('.blurred-bg.top');
			this._blurredLevel = 1;
			this.nodes.one('.menu-thumb')
				.addEventListener('click', this._onThumbClick.bind(this));

			var footer = this.nodes.one('#planets-app > .footer');
			this._display = new Display();
			this._display.on('display:trick', this._togglePlayback.bind(this));
			this._display.on('display:open', this._onDisplayOpen.bind(this));
			this._display.on('display:close', this._onDisplayClose.bind(this));
			footer.appendChild(this._display.root);
			this._playlist = new Playlist();
			footer.appendChild(this._playlist.root);

			this._planetScroller = new PlanetScroller();
			this.nodes.one('#planets-app > .planet-scroller').appendChild(this._planetScroller.root);
			this._planetScroller.on('planet:selected', this._onPlanetSelection.bind(this));
			this._planetScroller.on('planet:clicked', this._togglePlayback.bind(this));
			// this._menu = new Menu();
			// this._menu.on('menu:open', this._onMenuOpened.bind(this));
			// this._menu.on('menu:close', this._onMenuClosed.bind(this));
		},
		run: function() {
			network.getPlaylist(13721256).then(this._tracksFetched.bind(this));
		},
		next: function() {
			if (this._playingTrackIndex === this._selectedTrackIndex) {
				this._planetScroller.next();
			}
			this._tracks[this._playingTrackIndex].playing = false;
			this._playingTrackIndex++;
			if (this._playingTrackIndex === this._tracks.length) {
				this._playingTrackIndex = 0;
			}
			var track = this._tracks[this._playingTrackIndex];
			this._player.load(track.streamUrl);
		},
		_onThumbClick: function(e) {
			// this._menu.toggle();
		},
		_onMenuOpened: function() {

		},
		_onMenuClosed: function() {

		},

		_tracksFetched: function(data) {
			this._tracks = data;
			this._planetScroller.draw();
			this._planetScroller.data = data;
			this._playlist.data = data;
		},

		_onDisplayOpen: function() {
			this._planetScroller.toggleAnimation();
			this.nodes.one('#planets-app').classList.add('playlist-opened');
		},
		_onDisplayClose: function() {
			this._planetScroller.toggleAnimation();
			this.nodes.one('#planets-app').classList.remove('playlist-opened');
		},
		_togglePlayback: function() {
			if (this._playbackStatus === PLAYER_PLAYING) {
				this._tracks[this._playingTrackIndex].playing = false;
				if (this._selectedTrackIndex === this._playingTrackIndex) {
					this._player.pause();
				} else {
					this._playingTrackIndex = this._selectedTrackIndex;
					this._player.load(this._tracks[this._selectedTrackIndex].streamUrl);
				}
			} else {
				if (this._selectedTrackIndex === this._playingTrackIndex) {
					this._tracks[this._playingTrackIndex].playing = true;
					this._player.play();
				} else {
					this._playingTrackIndex = this._selectedTrackIndex;
					this._player.load(this._tracks[this._selectedTrackIndex].streamUrl);
				}
			}
		},
		_onPlanetSelection: function(idx) {
			var data = this._tracks[idx];
			setTimeout(function() {
				var img = document.createElement('img');
				img.crossOrigin = 'Anonymous';
				img.onload = function() {
					this._offscreenCtx.drawImage(img, 0, 0, BLURRED_CANVAS_SIZE, BLURRED_CANVAS_SIZE);
					blurWorker.postMessage({
						width: BLURRED_CANVAS_SIZE,
						height: BLURRED_CANVAS_SIZE,
						radius: 100,
						imageData: this._offscreenCtx.getImageData(0, 0, BLURRED_CANVAS_SIZE, BLURRED_CANVAS_SIZE)
					});
				}.bind(this);
				img.src = data.img;
			}.bind(this), 300);
			this._selectedTrackIndex = idx;
			this._display.data = data;
		},
		_onBlurWorkerComplete: function(e) {
			this._offscreenCtx.putImageData(e.data, 0, 0);
			this._redrawBackground = 20;
			this._drawBackground();
		},
		_drawBackground: function() {
			if (this._redrawBackground) {
				this._redrawBackground--;
				this._blurredCtx.globalAlpha = 1 / this._redrawBackground;
				this._blurredCtx.drawImage(this._offscreenCanvas, 0, 0);
				rAF(this._drawBackground.bind(this));
			}
		},

		// Player handlers
		_onPlayerLoading: function() {
			if (this._playingTrackIndex === this._selectedTrackIndex) {
				this._display.setTrick(Display.TRICK_LOADING);
			}
			if (this._playingTrackIndex) {
				this._tracks[this._playingTrackIndex].playing = false;
			}
		},
		_onPlayerReady: function() {
			this._tracks[this._playingTrackIndex].playing = true;
			this._player.play(0);
			if (this._playingTrackIndex === this._selectedTrackIndex) {
				this._display.setTrick(Display.TRICK_PAUSE);
			}
		},
		_onPlayerPlaying: function() {
			this._playbackStatus = PLAYER_PLAYING;
			if (this._playingTrackIndex === this._selectedTrackIndex) {
				this._display.setTrick(Display.TRICK_PAUSE);
			}
		},
		_onPlayerPaused: function() {
			this._playbackStatus = PLAYER_PAUSED;
			this._display.setTrick(Display.TRICK_PLAY);
		},
		_onPlayerEnded: function() {
			this._playbackStatus = PLAYER_PAUSED;
			this._display.setTrick(Display.TRICK_PLAY);
			this.next();
		}
	});

	return AppController;
});




console.log('Planets Demo \n \
	Design by Francesco Mastrogiacomo <masterjames@gmail.com>\n \
	Developed by Federico Giovagnoli <gvg.fede@gmail.com>');
