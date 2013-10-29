requirejs.config({
	baseUrl: 'js',
	paths: {
		tpl: '../templates'
	}
});

requirejs([
	'lib/common',
	'ctrl/app'
], function(
	x,
	App
) {

	var app = new App();
	if (x.device.isChromeMobile) {
		var _handleForceFullscreen = function(e) {
			var
				self = e.srcElement || e.target,
				el = document.documentElement,
				rfs = el.requestFullScreen
					|| el.webkitRequestFullScreen
					|| el.mozRequestFullScreen;

			rfs.call(el);
			self.removeEventListener('click', _handleForceFullscreen);
			document.body.removeChild(self);
			app.run();
		};
		var forceFullscreen = document.createElement('div');
		forceFullscreen.classList.add('force-fullscreen');
		document.body.appendChild(forceFullscreen);
		forceFullscreen.addEventListener('click', _handleForceFullscreen);
	} else {
		app.run();
	}

});
