import DomHandler from '../core/dom-handler.es6';

export default class Playlist extends DomHandler {
	constructor(o) {
		this.events = {
			'close-click': '_onCloseClick'
		};
		this._template = 'playlist';
		this._model = [];
		super(o);
		this._items = this.nodes.every('.track');
	}
	// @override
	refresh() {
		this._items = this.nodes.every('.track');
	}
	_onCloseClick() {
		this.emit('playlist:close');
	}
}
