import DomHandler from '../core/dom-handler.es6';

class Display extends DomHandler {
	constructor(o) {
		this.events = {
			'trick-click': '_onTrickBtnClick',
			'thumb-click': '_onThumbClick'
		};
		this._model = {};
		this._template = 'display';
		super(o);
	}

	setTrick(flag) {
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
	}
	// @override
	refresh() {
		if (this._model.playing) {
			this.setTrick(Display.TRICK_PAUSE);
		} else {
			this.setTrick(Display.TRICK_PLAY);
		}
	}
	_onTrickBtnClick() {
		this.emit('display:trick');
	}
	_onThumbClick() {
		this.emit('display:thumb');
	}
}

Display.TRICK_PLAY = 1;
Display.TRICK_PAUSE = 2;
Display.TRICK_LOADING = 4;

export default Display;
