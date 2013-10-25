define([
	'lib/common',
	'lib/class',
	'lib/dom-handler'
], function(
	x,
	Class,
	DomHandler
) {

	var
		ANDROID = x.deviceInfo.isAndroid,
		TOUCH_START_EVT = 'ontouchstart' in window ? 'touchstart' : 'mousedown',
		TOUCH_END_EVT = 'ontouchend' in window ? 'touchend' : 'mouseup',
		TOUCH_MOVE_EVT = 'ontouchmove' in window ? 'touchmove' : 'mousemove',
		PI2 = Math.PI * 2,
		RAD_15 = Math.PI/12,
		GALAXY_OFFSCREEN_Y = 215,
		GALAXY_TOPMOST = 0,
		GALAXY_TOP = 1,
		GALAXY_CENTER = 2,
		GALAXY_BOTTOM = 3,
		GALAXY_BOTTOMMOST = 4,
		GALAXY = [{
			// top off screen
			x: ANDROID ? 180: 160,
			y: ANDROID ? -205 : -110
		}, {
			// top visible
			x: ANDROID ? 180: 160,
			y: ANDROID ? 10 : 35
		}, {
			// center
			x: ANDROID ? 180: 160,
			y: ANDROID ? 225 : 180
		}, {
			// bottom visible
			x: ANDROID ? 180: 160,
			y: ANDROID ? 440 : 325
		}, {
			// bottom off screen
			x: ANDROID ? 180: 160,
			y: ANDROID ? 655 : 470
		}],
		RATIO = (function() {
			var devicePixelRatio = window.devicePixelRatio || 1;
			var backingStoreRatio = (function() {
				var canvas = document.createElement('canvas');
				var context = canvas.getContext('2d');
				return context.webkitBackingStorePixelRatio
					|| context.mozBackingStorePixelRatio
					|| context.msBackingStorePixelRatio
					|| context.oBackingStorePixelRatio
					|| context.backingStorePixelRatio
					|| 1;
			})();
			return devicePixelRatio / backingStoreRatio;
		})();

	RATIO = 2; // Debug


	var PlanetScroller = Class({
		parent: DomHandler,
		constructor: function(o) {
			this._pauseDraw = false;
			this._mask = document.createElement('img');
			this._mask.src = 'img/mask.png';
			var canvas = this._root = document.createElement('canvas');
			canvas.id = 'planets-canvas';
			this._ctx = this._root.getContext('2d');
			var oldWidth = ANDROID ? 360 : 320;
			var oldHeight = ANDROID ? 460 : 363;
			canvas.width = oldWidth * RATIO;
			canvas.height = oldHeight * RATIO;
			canvas.style.width = oldWidth + 'px';
			canvas.style.height = oldHeight + 'px';

			this._planets = [];
			this._planets.push(new Planet({
				position: GALAXY_CENTER,
				data: {
					img: 'img/demo-cover-6.jpg',
					title: 'Mouthful of Diamonds',
					artist: 'Phantogram',
					album: 'Eyelid Movies',
					year: '2010',
					duration: '3:14'
				}
			}));
			this._planets.push(new Planet({
				position: GALAXY_TOP,
				data: {
					img: 'img/demo-cover-2.jpg',
					title: 'Bethos',
					artist: 'Gifts From Enola',
					album: 'From Fathom',
					year: '2009',
					duration: '3:14'
				}
			}));
			this._planets.push(new Planet({
				position: GALAXY_BOTTOM,
				data: {
					img: 'img/demo-cover-3.jpg',
					title: 'Odyssey Rescue',
					artist: 'M83',
					album: 'Oblivion EP',
					year: '2013',
					duration: '3:14'
				}
			}));
			this._planets.push(new Planet({
				position: GALAXY_TOPMOST,
				data: {
					img: 'img/demo-cover-4.jpg',
					title: 'Scar',
					artist: 'Cloud Control',
					album: 'Dream Cave',
					year: '2013',
					duration: '3:14'
				}
			}));
			this._planets.push(new Planet({
				position: GALAXY_BOTTOMMOST,
				data: {
					img: 'img/demo-cover-5.png',
					title: 'Beat The System',
					artist: '501',
					album: 'Beat The System EP',
					year: '2013',
					duration: '3:14'
				}
			}));
			for (var i = 0, p; p = this._planets[i]; i++) {
				p.on('planet:selected', this._onPlanetSelection.bind(this));
			}

			this._moveEnabled = false;
			canvas.addEventListener(TOUCH_START_EVT, this._onHoldClick.bind(this));
			canvas.addEventListener(TOUCH_END_EVT, this._onReleaseClick.bind(this));
			canvas.addEventListener(TOUCH_MOVE_EVT, this._onMove.bind(this));
			this.update();
		},
		draw: function() {
			rAF(this.draw.bind(this));
			this._draw();
		},
		update: function() {
			rAF(this.update.bind(this));
			this._update();
		},
		toggleAnimation: function(forcePlay) {
			if (forcePlay) {
				this._pauseDraw = false;
			} else {
				this._pauseDraw = !this._pauseDraw;
			}
		},
		_draw: function() {
			if (this._pauseDraw) {
				return;
			}
			this._root.width = this._root.width;
			for (var i = 0, p; p = this._planets[i]; i++) {
				p.draw(this._ctx);
			}
			this._ctx.globalCompositeOperation = 'destination-in';
			this._ctx.drawImage(this._mask, 0, 0, this._root.width, this._root.height);
		},
		_update: function() {
			if (!this._deltaPlanetMovement || this._pauseDraw) {
				return;
			}
			for (var i = 0, p; p = this._planets[i]; i++) {
				p.move(this._deltaPlanetMovement);
			}
			this._deltaPlanetMovement = 0;
		},
		_onMove: function(e) {
			e.preventDefault();
			if (!this._moveEnabled) {
				return;
			}
			this._deltaPlanetMovement = e.webkitMovementY;
			if (e.touches) {
				this._deltaPlanetMovement = -(this._touchStartY - e.touches[0].pageY);
				this._touchStartY = e.touches[0].pageY;
			}
		},
		_onHoldClick: function(e) {
			this._moveEnabled = true;
			if (e.touches) {
				this._touchStartY = e.touches[0].pageY;
			}
		},
		_onReleaseClick: function(e) {
			this._moveEnabled = false;
			var direction = this._planets[2].offset > 0 ? 1 : -1
			for (var i = 0, p; p = this._planets[i]; i++) {
				p.snap(direction);
			}
		},
		_onPlanetSelection: function(data) {
			this.emit('planet:selected', data);
		}
	});

	var Planet = Class({
		parent: DomHandler,
		constructor: function(o) {
			this._imgReady = false;
			this._defaultR = ANDROID ? 120 : 80;
			this._data = o.data;
			this._satelliteP = 0;

			var pos = this._pos = o.position;
			this._x = GALAXY[pos].x;
			this._y = GALAXY[pos].y;
			this._cd = GALAXY[GALAXY_CENTER].y - GALAXY[GALAXY_TOP].y;
			this._r = this._calcRadius();

			this._img = document.createElement('img');
			this._img.onload = function() {
				var rgb = this._calcDominantColor();
				this._dominantColor = 'rgba(' + [rgb.r,rgb.g,rgb.b].join(',');
			}.bind(this);
			this._img.src = o.data.img;
		},
		accessors: {
			offset: {
				get: function() {
					return this._y - GALAXY[this._pos].y
				}
			},
			data: {
				get: function() {
					return this._data;
				},
				set: function(data) {
					this._data = data;
				}
			}
		},
		draw: function(ctx) {
			if (this._offscreen) {
				return;
			}

			var
				me = this,
				r = me._r * RATIO,
				x = me._x * RATIO,
				y = me._y * RATIO,
				dx = (me._x - me._r) * RATIO,
				dy = (me._y - me._r) * RATIO,
				imgDim = r * 2.1;

			ctx.save();
			ctx.beginPath();
			ctx.arc(x , y, r, 0, PI2, true);
			ctx.closePath();
			ctx.clip();

			ctx.drawImage(this._img, dx, dy, imgDim, imgDim);

			ctx.beginPath();
			ctx.arc(0, 0, r, 0, PI2, true);
			ctx.clip();
			ctx.closePath();
			ctx.restore();

			this._drawSatellite(ctx, x, y, r);
		},
		_drawSatellite: function(ctx, x, y, r) {
			r += 10;
			this._satelliteP += 0.05;
			var
				width = 4,
				sp = this._satelliteP,
				endDeg = (PI2 / 25);

			ctx.lineWidth = width;
			for (var i = 1; i <= 25; i++) {
				if (i < 20) {
					ctx.strokeStyle = 'rgba(250, 250, 250, 0.05)';
				} else {
					ctx.strokeStyle = this._dominantColor + ', 0.4)';
				}
				ctx.beginPath();
				ctx.arc(x, y, r, 1 + sp, endDeg * i + sp, true);
				ctx.stroke();
			}
			ctx.lineWidth = 8;
			ctx.strokeStyle = this._dominantColor + ', 0.8)';
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.arc(x, y, r, endDeg + 25.89 + sp, endDeg + 25.86 + sp, true);
			ctx.stroke();

			ctx.restore(); // restore clipping region to default
		},
		move: function(delta) {
			this._y += delta;
			this._r = this._calcRadius();
			if (this._y + this._r >= GALAXY[4].y || this._y - this._r <= GALAXY[0].y) {
				this._offscreen = true;
			} else {
				this._offscreen = false;
			}
		},
		snap: function(direction) {
			if (direction > 0) {
				this._pos++;
				if (this._pos === GALAXY.length) {
					this._pos = 0;
					this._offscreen = true;
				} else {
					this._offscreen = false;
				}
			} else {
				this._pos--;
				if (this._pos === -1) {
					this._pos = GALAXY.length - 1;
					this._offscreen = true;
				} else {
					this._offscreen = false;
				}
			}
			this._x = GALAXY[this._pos].x;
			this._y = GALAXY[this._pos].y;
			this._r = this._calcRadius();

			if (this._pos === 2) {
				this.emit('planet:selected', this._data);
			}
		},
		_calcRadius: function() {
			var distance = Math.abs(GALAXY[GALAXY_CENTER].y - this._y);
			var r = Math.max(1, this._defaultR - parseInt((45 * (distance + 1) / this._cd)));
			return r;
		},
		_calcDominantColor: function() {
			var
				blockSize = 5, // only visit every 5 pixels
				canvas = document.createElement('canvas'),
				ctx = canvas.getContext('2d'),
				data, width, height,
				i = -4,
				length,
				rgb = {r:0,g:0,b:0},
				count = 0;

			height = canvas.height = this._img.naturalHeight || this._img.offsetHeight || this._img.height;
			width = canvas.width = this._img.naturalWidth || this._img.offsetWidth || this._img.width;

			ctx.drawImage(this._img, 0, 0);
			data = ctx.getImageData(0, 0, width, height);

			length = data.data.length;
			while ((i += blockSize * 4) < length) {
				if (data.data[i] > 150 || data.data[i+1] > 150 || data.data[i+2] > 150) {
					++count;
					rgb.r += data.data[i];
					rgb.g += data.data[i+1];
					rgb.b += data.data[i+2];
				}
			}
			rgb.r = ~~(rgb.r/count);
			rgb.g = ~~(rgb.g/count);
			rgb.b = ~~(rgb.b/count);
			return rgb;
		}
	});

	return PlanetScroller;
});
