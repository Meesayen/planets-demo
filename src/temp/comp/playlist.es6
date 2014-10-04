var $__Object$defineProperties = Object.defineProperties;
var $__Object$defineProperty = Object.defineProperty;
var $__Object$create = Object.create;
var $__Object$getPrototypeOf = Object.getPrototypeOf;
"use strict";
var DomHandler = require("../core/dom-handler.es6")["default"];

exports["default"] = function($__super) {
    "use strict";

    function Playlist(o) {
		this.events = {
			'close-click': '_onCloseClick'
		};
		this._template = 'playlist';
		this._model = [];
		$__Object$getPrototypeOf(Playlist.prototype).constructor.call(this, o);
		this._items = this.nodes.every('.track');
	}

    Playlist.__proto__ = ($__super !== null ? $__super : Function.prototype);
    Playlist.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(Playlist.prototype, "constructor", {
        value: Playlist
    });

    $__Object$defineProperties(Playlist.prototype, {
        refresh: {
            value: function() {
                this._items = this.nodes.every('.track');
            },

            enumerable: false,
            writable: true
        },

        _onCloseClick: {
            value: function() {
                this.emit('playlist:close');
            },

            enumerable: false,
            writable: true
        }
    });

    return Playlist;
}(DomHandler);