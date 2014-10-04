var $__Object$defineProperties = Object.defineProperties;
var $__Object$defineProperty = Object.defineProperty;
var $__Object$create = Object.create;
"use strict";
var EventEmitter = require("../core/eventemitter.es6")["default"];

exports["default"] = function($__super) {
    "use strict";

    function Player() {
		this.root = document.createElement('audio');
		this._source = document.createElement('source');
		this.root.appendChild(this._source);
		this.root.addEventListener('loadeddata', this._sourceLoaded.bind(this));
		this.root.addEventListener('ended', this._playbackEnded.bind(this));
		this.root.addEventListener('pause', this._playbackPaused.bind(this));
		this.root.addEventListener('timeupdate', this._playbackTimeupdate.bind(this));
		// this.root.addEventListener('suspend', this._playbackSuspended.bind(this));
	}

    Player.__proto__ = ($__super !== null ? $__super : Function.prototype);
    Player.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(Player.prototype, "constructor", {
        value: Player
    });

    $__Object$defineProperties(Player.prototype, {
        play: {
            value: function() {
                if (this._loaded) {
                    this.root.play();
                    this.emit('audio:playing');
                }
            },

            enumerable: false,
            writable: true
        },

        pause: {
            value: function() {
                if (this._loaded) {
                    this.root.pause();
                }
            },

            enumerable: false,
            writable: true
        },

        load: {
            value: function(url) {
                this.emit('audio:loading');
                this._loaded = false;
                this._source.src = url;
                this.root.load();
            },

            enumerable: false,
            writable: true
        },

        _sourceLoaded: {
            value: function() {
                this._loaded = true;
                this.emit('audio:ready');
            },

            enumerable: false,
            writable: true
        },

        _playbackEnded: {
            value: function() {
                this.emit('audio:ended');
            },

            enumerable: false,
            writable: true
        },

        _playbackTimeupdate: {
            value: function() {
                if (this.root.duration && this.root.duration - 1 < this.root.currentTime) {
                    this._playbackEnded();
                }
            },

            enumerable: false,
            writable: true
        },

        _playbackPaused: {
            value: function() {
                this.emit('audio:paused');
            },

            enumerable: false,
            writable: true
        }
    });

    return Player;
}(EventEmitter);