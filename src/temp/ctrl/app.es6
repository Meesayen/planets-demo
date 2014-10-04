var $__Object$defineProperties = Object.defineProperties;
var $__Object$defineProperty = Object.defineProperty;
var $__Object$create = Object.create;
"use strict";

/*!
 * Planets 1.0.1
 * A simple handler function which makes easy the creation and
 * extension of classes.
 *
 * Copyright 2013, Federico Giovagnoli <mailto:gvg.fede@gmail.com>
 * Designed by Francesco Mastrogiacomo (niftygift)
 * Released under the MIT license
 */


var device = require("../core/utils.es6").device;

var DomHandler = require("../core/dom-handler.es6")["default"];
var network = require("./network.es6")["default"];
var Player = require("./player.es6")["default"];
var Display = require("../comp/display.es6")["default"];
var Playlist = require("../comp/playlist.es6")["default"];
var PlanetScroller = require("../comp/planet-scroller.es6")["default"];

var
	MOBILE = device.isMobile,
	BLURRED_CANVAS_SIZE = MOBILE ? screen.availWidth * 2 : 640,
	blurWorker = new Worker('js/workers/blur-worker.js'),
	PLAYER_PLAYING = 1,
	PLAYER_PAUSED = 2;

exports["default"] = function($__super) {
    "use strict";

    function App() {
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

		this._playlist = new Playlist();
		this._playlist.on('playlist:close', this._onPlaylistClose.bind(this));
		this.nodes.one('#planets-app').appendChild(this._playlist.root);
		this._display = new Display();
		this._display.on('display:trick', this._togglePlayback.bind(this));
		this._display.on('display:thumb', this._onDisplayThumb.bind(this));
		this.nodes.one('#planets-app').appendChild(this._display.root);

		var ps = this._planetScroller = new PlanetScroller();
		this.nodes.one('#planets-app > .planet-scroller').appendChild(ps.root);
		ps.on('planet:selected', this._onPlanetSelection.bind(this));
		ps.on('planet:clicked', this._togglePlayback.bind(this));
		// this._menu = new Menu();
		// this._menu.on('menu:open', this._onMenuOpened.bind(this));
		// this._menu.on('menu:close', this._onMenuClosed.bind(this));
	}

    App.__proto__ = ($__super !== null ? $__super : Function.prototype);
    App.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(App.prototype, "constructor", {
        value: App
    });

    $__Object$defineProperties(App.prototype, {
        run: {
            value: function() {
                network.getPlaylist(13721256).then(this._tracksFetched.bind(this));
            },

            enumerable: false,
            writable: true
        },

        next: {
            value: function() {
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

            enumerable: false,
            writable: true
        },

        _onThumbClick: {
            value: function() {
                // this._menu.toggle();
            },

            enumerable: false,
            writable: true
        },

        _onMenuOpened: {
            value: function() {

            },

            enumerable: false,
            writable: true
        },

        _onMenuClosed: {
            value: function() {

            },

            enumerable: false,
            writable: true
        },

        _tracksFetched: {
            value: function(data) {
                this._tracks = data;
                this._planetScroller.draw();
                this._planetScroller.model = data;
                this._playlist.model = data;
            },

            enumerable: false,
            writable: true
        },

        _onDisplayThumb: {
            value: function() {
                this._planetScroller.toggleAnimation();
                this.nodes.one('#planets-app').classList.add('playlist-opened');
            },

            enumerable: false,
            writable: true
        },

        _onPlaylistClose: {
            value: function() {
                this._planetScroller.toggleAnimation();
                this.nodes.one('#planets-app').classList.remove('playlist-opened');
            },

            enumerable: false,
            writable: true
        },

        _togglePlayback: {
            value: function() {
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

            enumerable: false,
            writable: true
        },

        _onPlanetSelection: {
            value: function(idx) {
                var data = this._tracks[idx];
                setTimeout(function() {
                    var img = document.createElement('img');
                    img.crossOrigin = 'Anonymous';
                    img.onload = function() {
                        console.log(this);
                        this._offscreenCtx.drawImage(img, 0, 0,
                                BLURRED_CANVAS_SIZE, BLURRED_CANVAS_SIZE);
                        blurWorker.postMessage({
                            width: BLURRED_CANVAS_SIZE,
                            height: BLURRED_CANVAS_SIZE,
                            radius: 100,
                            imageData: this._offscreenCtx.getImageData(0, 0,
                                    BLURRED_CANVAS_SIZE, BLURRED_CANVAS_SIZE)
                        });
                    }.bind(this);
                    img.src = data.img;
                }.bind(this), 300);
                this._selectedTrackIndex = idx;
                this._display.model = data;
            },

            enumerable: false,
            writable: true
        },

        _onBlurWorkerComplete: {
            value: function(e) {
                this._offscreenCtx.putImageData(e.data, 0, 0);
                this._redrawBackground = 20;
                this._drawBackground();
            },

            enumerable: false,
            writable: true
        },

        _drawBackground: {
            value: function() {
                if (this._redrawBackground) {
                    this._redrawBackground--;
                    this._blurredCtx.globalAlpha = 1 / this._redrawBackground;
                    this._blurredCtx.drawImage(this._offscreenCanvas, 0, 0);
                    requestAnimationFrame(this._drawBackground.bind(this));
                }
            },

            enumerable: false,
            writable: true
        },

        _onPlayerLoading: {
            value: function() {
                if (this._playingTrackIndex === this._selectedTrackIndex) {
                    this._display.setTrick(Display.TRICK_LOADING);
                }
                if (this._playingTrackIndex) {
                    this._tracks[this._playingTrackIndex].playing = false;
                }
            },

            enumerable: false,
            writable: true
        },

        _onPlayerReady: {
            value: function() {
                this._tracks[this._playingTrackIndex].playing = true;
                this._player.play();
            },

            enumerable: false,
            writable: true
        },

        _onPlayerPlaying: {
            value: function() {
                this._playbackStatus = PLAYER_PLAYING;
                if (this._playingTrackIndex === this._selectedTrackIndex) {
                    this._display.setTrick(Display.TRICK_PAUSE);
                }
            },

            enumerable: false,
            writable: true
        },

        _onPlayerPaused: {
            value: function() {
                this._playbackStatus = PLAYER_PAUSED;
                this._display.setTrick(Display.TRICK_PLAY);
            },

            enumerable: false,
            writable: true
        },

        _onPlayerEnded: {
            value: function() {
                this._playbackStatus = PLAYER_PAUSED;
                this._display.setTrick(Display.TRICK_PLAY);
                this.next();
            },

            enumerable: false,
            writable: true
        }
    });

    return App;
}(DomHandler);