// <pre>
//	Planets  1.0.0

//	(c) 2013 Federico Giovagnoli (meesayen)
//	Designed by Francesco Mastrogiacomo (niftygift)
//	Planets may be freely distributed under the MIT license.
// </pre>

define([
	'lib/common',
	'lib/class',
	'lib/dom-handler',

	'comp/display',
	'comp/playlist',
	'comp/planet-scroller'
], function(
	x,
	Class,
	DomHandler,

	Display,
	Playlist,
	PlanetScroller
) {

	var AppController = Class({
		parent: DomHandler,
		constructor: function() {
			this._root = document.body;
			if (!x.deviceInfo.isAndroid) {
				this._root.classList.add('web-demo');
			}
			this._label = this.nodes.one('.header .label');
			var blurredCanvas = this.nodes.one('.blurred-bg');
			blurredCanvas.width = 640;
			blurredCanvas.height = 640;
			this._blurredCtx = blurredCanvas.getContext('2d');
			this._blurredTop = this.nodes.one('.blurred-bg.top');
			this._blurredLevel = 1;
			this.nodes.one('.menu-thumb')
				.addEventListener('click', this._onThumbClick.bind(this));

			var footer = this.nodes.one('#planets-app > .footer');
			this._display = new Display();
			this._onPlanetSelection({
				img: 'img/demo-cover-6.jpg',
				title: 'Mouthful of Diamonds',
				artist: 'Phantogram',
				album: 'Eyelid Movies',
				year: '2010',
				duration: '3:14'
			});
			this._display.on('display:open', this._onDisplayOpen.bind(this));
			this._display.on('display:close', this._onDisplayClose.bind(this));
			footer.appendChild(this._display.root);
			this._playlist = new Playlist();
			footer.appendChild(this._playlist.root);

			this._planetScroller = new PlanetScroller();
			this.nodes.one('#planets-app > .planet-scroller').appendChild(this._planetScroller.root);
			this._planetScroller.draw();
			this._planetScroller.on('planet:selected', this._onPlanetSelection.bind(this));
			// this._menu = new Menu();
			// this._menu.on('menu:open', this._onMenuOpened.bind(this));
			// this._menu.on('menu:close', this._onMenuClosed.bind(this));
		},
		run: function() {

		},
		_onThumbClick: function(e) {
			// this._menu.toggle();
		},
		_onMenuOpened: function() {

		},
		_onMenuClosed: function() {

		},

		_onDisplayOpen: function() {
			this._planetScroller.toggleAnimation();
			this.nodes.one('#planets-app').classList.add('playlist-opened');;
		},
		_onDisplayClose: function() {
			this._planetScroller.toggleAnimation();
			this.nodes.one('#planets-app').classList.remove('playlist-opened');;
		},

		_onPlanetSelection: function(data) {
			setTimeout(function() {
				var img = document.createElement('img');
				img.onload = function() {
					this._blurredCtx.drawImage(img, 0, 0, 640, 640);
					boxBlurCanvasRGBA('blurred-canvas', 0, 0, 640, 640, 55, 2);
				}.bind(this);
				img.src = data.img;
			}.bind(this), 300);
			this._display.data = data;
		}
	});

	return AppController;
});




console.log('Planets Demo \n \
	Design by Francesco Mastrogiacomo <masterjames@gmail.com>\n \
	Developed by Federico Giovagnoli <gvg.fede@gmail.com>');
