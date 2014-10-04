var $__Object$defineProperties = Object.defineProperties;
var $__Object$defineProperty = Object.defineProperty;
var $__Object$create = Object.create;
var $__Object$getPrototypeOf = Object.getPrototypeOf;
"use strict";
var DomHandler = require("../core/dom-handler.es6")["default"];

var Display = function($__super) {
    "use strict";

    function Display(o) {
		this.events = {
			'trick-click': '_onTrickBtnClick',
			'thumb-click': '_onThumbClick'
		};
		this._model = {};
		this._template = 'display';
		$__Object$getPrototypeOf(Display.prototype).constructor.call(this, o);
	}

    Display.__proto__ = ($__super !== null ? $__super : Function.prototype);
    Display.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(Display.prototype, "constructor", {
        value: Display
    });

    $__Object$defineProperties(Display.prototype, {
        setTrick: {
            value: function(flag) {
                var trick = this.nodes.one('.trick-btn');
                if (flag & Display.TRICK_LOADING) {
                    trick.classList.remove('pause');
                    trick.classList.remove('play');
                    trick.classList.add('loading');
                } else if (flag & Display.TRICK_PAUSE) {
                    trick.classList.remove('loading');
                    trick.classList.remove('play');
                    trick.classList.add('pause');
                } else {
                    trick.classList.remove('loading');
                    trick.classList.remove('pause');
                    trick.classList.add('play');
                }
            },

            enumerable: false,
            writable: true
        },

        refresh: {
            value: function() {
                if (this._model.playing) {
                    this.setTrick(Display.TRICK_PAUSE);
                } else {
                    this.setTrick(Display.TRICK_PLAY);
                }
            },

            enumerable: false,
            writable: true
        },

        _onTrickBtnClick: {
            value: function() {
                this.emit('display:trick');
            },

            enumerable: false,
            writable: true
        },

        _onThumbClick: {
            value: function() {
                this.emit('display:thumb');
            },

            enumerable: false,
            writable: true
        }
    });

    return Display;
}(DomHandler);

Display.TRICK_PLAY = 1;
Display.TRICK_PAUSE = 2;
Display.TRICK_LOADING = 4;
exports["default"] = Display;