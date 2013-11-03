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
		MOBILE = x.device.isMobile,
		TOUCH_START_EVT = 'ontouchstart' in window ? 'touchstart' : 'mousedown',
		TOUCH_END_EVT = 'ontouchend' in window ? 'touchend' : 'mouseup',
		TOUCH_MOVE_EVT = 'ontouchmove' in window ? 'touchmove' : 'mousemove',
		SCREEN_WIDTH = MOBILE ? screen.availWidth : 320,
		SCREEN_HEIGHT = MOBILE ? screen.availHeight : 495,
		PI2 = Math.PI * 2,
		DEG_UNIT = Math.PI / 180,

		// Galaxy Constants
		GALAXY_CANVAS_HEIGHT = SCREEN_HEIGHT - 50 - 80,
		GALAXY_OFFSCREEN_Y = 215,
		GALAXY_TOPMOST = 0,
		GALAXY_TOP = 1,
		GALAXY_CENTER = 2,
		GALAXY_BOTTOM = 3,
		GALAXY_BOTTOMMOST = 4,
		GALAXY = [], // Calculated later
		SECONDARY_PLANET_SMALLNESS = 60, // Percentage of smallness
		MAIN_PLANET_RADIUS = 0, // Calculated Later
		PLANETS_DISTANCE_DELTA = 0, // Calculated Later
		PLANETS_MARGIN = 20,

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

	if (!MOBILE) {
		RATIO = 2; // Debug
	}

	var
		RING_IMG = document.createElement('img'),
		ringImgSrc = x.cache.get('ring-img-src');
	if (ringImgSrc) {
		RING_IMG.src = ringImgSrc;
	} else {
		(function() {
			var
				img = document.createElement('img'),
				canvas = document.createElement('canvas'),
				ctx = canvas.getContext('2d');
			img.onload = function() {
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0, img.width, img.height);
				RING_IMG.src = canvas.toDataURL();
				x.cache.set('ring-img-src', RING_IMG.src)
			};
			img.src = 'img/ring.png';
		})();
	}


	var PlanetScroller = Class({
		parent: DomHandler,
		constructor: function(o) {
			this._data = [];
			this._head = 0;
			this._tail = 0;
			this._pauseDraw = true;
			this._mask = document.createElement('img');
			this._mask.src = 'img/mask.png';
			var canvas = this._root = document.createElement('canvas');
			canvas.id = 'planets-canvas';
			this._ctx = this._root.getContext('2d');
			this._ctx.webkitImageSmoothingEnabled = true;
			var oldWidth = SCREEN_WIDTH;
			var oldHeight = GALAXY_CANVAS_HEIGHT;
			canvas.width = oldWidth * RATIO;
			canvas.height = oldHeight * RATIO;
			canvas.style.width = oldWidth + 'px';
			canvas.style.height = oldHeight + 'px';

			this._calculateGalaxyPoints();

			this._planets = [];
			this._createPlanets();

			this._moveEnabled = false;
			canvas.addEventListener(TOUCH_START_EVT, this._onHoldClick.bind(this));
			canvas.addEventListener(TOUCH_END_EVT, this._onReleaseClick.bind(this));
			canvas.addEventListener(TOUCH_MOVE_EVT, this._onMove.bind(this));
			this.update();
		},
		accessors: {
			data: {
				get: function() {
					return this._data;
				},
				set: function(data) {
					this._data = data;
					this._refresh();
				}
			}
		},
		draw: function() {
			var c = this._root;
			this._draw(c, this._ctx, c.width, c.height, this._planets, this._mask);
		},
		update: function() {
			this._update();
			rAF(this.update.bind(this));
		},
		toggleAnimation: function(forcePlay) {
			if (forcePlay) {
				this._pauseDraw = false;
			} else {
				this._pauseDraw = !this._pauseDraw;
			}
		},
		_createPlanets: function() {
			if (!RING_IMG.src) {
				rAF(this._createPlanets.bind(this));
				return;
			}
			this._planets.push(new Planet({
				position: GALAXY_CENTER
			}));
			this._planets.push(new Planet({
				position: GALAXY_BOTTOM
			}));
			this._planets.push(new Planet({
				position: GALAXY_BOTTOMMOST
			}));
			this._planets.push(new Planet({
				position: GALAXY_TOP
			}));
			this._planets.push(new Planet({
				position: GALAXY_TOPMOST
			}));
			for (var i = 0, p; p = this._planets[i]; i++) {
				p.on('planet:selected', this._onPlanetSelection.bind(this));
			}
			this._refresh();
			this._pauseDraw = false;
		},
		_refresh: function() {
			if (this._data && this._data[0]) {
				var
					dataLen = this.data.length,
					p = null;
				this._head = 0;
				this._tail = 0;
				this._head = this._calculateIndex(this._head, -1, -1, dataLen);
				this._head = this._calculateIndex(this._head, -1, -1, dataLen);
				for (var i = 0; i < 3; i++) {
					p = this._planets[i];
					p.data = this._data[this._tail];
					this._tail = this._calculateIndex(this._tail, 1, dataLen, 0);
				}
				for (var i = 3; i < 5; i++) {
					p = this._planets[i];
					p.data = this._data[this._head];
					this._head = this._calculateIndex(this._head, 1, dataLen, 0);
				}
			}
		},
		_draw: function(canvas, ctx, w, h, planets, mask) {
			this.__draw(canvas, ctx, w, h, planets, mask);
			rAF(this._draw.bind(this, canvas, ctx, w, h, planets, mask));
		},
		__draw: function(canvas, ctx, w, h, planets, mask) {
			if (this._pauseDraw) {
				return;
			}
			canvas.width = w;
			for (var i = 0, p; p = planets[i]; i++) {
				p.draw(ctx);
			}
			ctx.globalCompositeOperation = 'destination-in';
			ctx.drawImage(mask, 0, 0, w, h);
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
				this._deltaPlanetMovement = -(this._touchY - e.touches[0].pageY);
				this._touchY = e.touches[0].pageY;
			}
		},
		_onHoldClick: function(e) {
			// e.preventDefault();
			this._moveEnabled = true;
			if (e.touches) {
				this._touchY = e.touches[0].pageY;
				this._startY = e.touches[0].pageY;
			} else {
				this._startY = e.pageY;
			}
		},
		_onReleaseClick: function(e) {
			this._deltaPlanetMovement = 0;
			this._moveEnabled = false;
			var endY = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
			var direction = this._planets[2].offset > 0 ? 1 : -1
			if (Math.abs(this._startY - endY) < 55) {
				direction *= 1.1;
			}
			var pos, index;
			if (direction === 1) {
				pos = 0;
				index = this._head;
				this._unshiftIndex();
			} else if (direction === -1) {
				pos = 4;
				index = this._tail;
				this._shiftIndex();
			}
			for (var i = 0, p; p = this._planets[i]; i++) {
				p.snap(direction);
				if (p.position === pos) {
					p.data = this._data[index];
				}
			}
		},
		_shiftIndex: function() {
			var dataLen = this._data.length;
			this._head = this._calculateIndex(this._head, 1, dataLen, 0);
			this._tail = this._calculateIndex(this._tail, 1, dataLen, 0);
		},
		_unshiftIndex: function() {
			var dataLen = this._data.length;
			this._head = this._calculateIndex(this._head, -1, -1, dataLen - 1);
			this._tail = this._calculateIndex(this._tail, -1, -1, dataLen - 1);
		},
		_calculateIndex: function(index, step, limit, fallback) {
			index += step;
			if (index === limit) {
				index = fallback;
			}
			return index;
		},
		_onPlanetSelection: function(data) {
			this.emit('planet:selected', data);
		},
		_calculateGalaxyPoints: function() {
			var
				galaxyCenterX = SCREEN_WIDTH / 2,
				galaxyCenterY = GALAXY_CANVAS_HEIGHT / 2,
				radius = GALAXY_CANVAS_HEIGHT / 5 * 3;

			MAIN_PLANET_RADIUS = (radius > SCREEN_WIDTH ?
					SCREEN_WIDTH - 30 : radius) / 2;
			var secondaryPlanetRadius = Math.round(MAIN_PLANET_RADIUS
					* SECONDARY_PLANET_SMALLNESS / 100),
				distanceFromMainPlanet = MAIN_PLANET_RADIUS
					+ secondaryPlanetRadius + PLANETS_MARGIN;

			PLANETS_DISTANCE_DELTA = MAIN_PLANET_RADIUS - secondaryPlanetRadius;
			GALAXY = [{
				// top off screen
				x: galaxyCenterX,
				y: galaxyCenterY - distanceFromMainPlanet * 2
			}, {
				// top visible
				x: galaxyCenterX,
				y: galaxyCenterY - distanceFromMainPlanet
			}, {
				// center
				x: galaxyCenterX,
				y: galaxyCenterY
			}, {
				// bottom visible
				x: galaxyCenterX,
				y: galaxyCenterY + distanceFromMainPlanet
			}, {
				// bottom off screen
				x: galaxyCenterX,
				y: galaxyCenterY + distanceFromMainPlanet * 2
			}]
		}
	});

	var Planet = Class({
		parent: DomHandler,
		constructor: function(o) {
			this._imgReady = false;
			this._data = null;
			this._deg = Math.floor(Math.random() * 360);
			var oc = this._satOffCanvas = document.createElement('canvas');
			oc.width = RING_IMG.width;
			oc.height = RING_IMG.height;
			this._satOffCtx = oc.getContext('2d');

			var pos = this._pos = o.position;
			this._x = GALAXY[pos].x;
			this._y = GALAXY[pos].y;
			this._distanceFraction = PLANETS_DISTANCE_DELTA /
				(GALAXY[GALAXY_CENTER].y - GALAXY[GALAXY_TOP].y);
			this._r = this._calcRadius();

			this._coverImg = document.createElement('img');
			this._coverImg.crossOrigin = 'Anonymous';
			this._ringImg = document.createElement('img');
			this._coverImg.onload = function() {
				var
					ctx = this._satOffCtx,
					rgb = this._calcDominantColor(),
					dim = RING_IMG.width,
					dominantColor = 'rgb(' + [rgb.r,rgb.g,rgb.b].join(',') + ')',
					gradient = ctx.createLinearGradient(0, 0, dim, dim);
				gradient.addColorStop(0, dominantColor);
				gradient.addColorStop(0.6, dominantColor);
				gradient.addColorStop(0.7, 'rgb(255, 255, 255)');
				gradient.addColorStop(1, 'rgb(255, 255, 255)');
				ctx.fillStyle = gradient;
				ctx.fillRect(0, 0, dim, dim);
				ctx.globalCompositeOperation = 'destination-in';
				ctx.drawImage(RING_IMG, 0, 0);
				this._ringImg.src = this._satOffCanvas.toDataURL();
				ctx.translate(RING_IMG.width / 2, RING_IMG.width / 2);
				ctx.globalCompositeOperation = 'copy';
				this._dominantColor = [rgb.r,rgb.g,rgb.b].join(',');
			}.bind(this);
		},
		accessors: {
			offset: {
				get: function() {
					return this._y - GALAXY[this._pos].y
				}
			},
			position: {
				get: function() {
					return this._pos;
				}
			},
			data: {
				get: function() {
					return this._data;
				},
				set: function(data) {
					if (this._data) {
						var d = (RING_IMG.width / 2);
						this._dominantColor = null;
						this._satOffCtx.translate(-d, -d);
					}
					this._data = data;
					this._refresh();
				}
			}
		},
		_refresh: function() {
			this._coverImg.src = this._data.img;
			if (this._pos === 2) {
				this.emit('planet:selected', this._data);
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
				imgDim = r * 2;

			ctx.save();
			ctx.beginPath();
			ctx.arc(x , y, r, 0, PI2, true);
			ctx.closePath();
			ctx.clip();

			ctx.drawImage(this._coverImg, dx, dy, imgDim, imgDim);

			ctx.beginPath();
			ctx.arc(0, 0, r, 0, PI2, true);
			ctx.clip();
			ctx.closePath();
			ctx.restore();

			// this._drawSatellite(ctx, x, y, r);
			this._drawSatelliteWithImage(ctx, x, y, r);
		},

		// Drawing the satellite using a cached image and rotating the canvas.
		// Better performance on Chrome for Android: ~20 FPS
		// Slightly worse performance on Chrome Desktop: ~55 FPS
		_drawSatelliteWithImage: function(ctx, x, y, r) {
			if (!RING_IMG || !this._dominantColor) return;
			var
				_ctx = this._satOffCtx,
				deg = ++this._deg;
			if (deg > 360) {
				deg = this._deg = 0;
			}

			var
				dim = RING_IMG.width,
				halfDim = dim / 2,
				rd = (dim  * r) / halfDim + 20,
				halfRd = rd / 2;

			_ctx.save();
			_ctx.rotate(deg*DEG_UNIT);
			_ctx.drawImage(this._ringImg, -halfDim, -halfDim);
			_ctx.restore();
			ctx.drawImage(this._satOffCanvas, x - halfRd, y - halfRd, rd, rd);
		},
		// Drawing the satellite programmatically.
		// Best performance on Chrome Desktop: +80 FPS
		// Worst performance on Chrome for Android: <15 FPS
		_drawSatellite: function(ctx, x, y, r) {
			r += 5 * RATIO;
			this._deg += 0.02;
			if (this._deg > 6.301) {
				this._deg = 0;
			}
			var
				sp = this._deg,
				endDeg = (PI2 / 25),
				dominantColor = 'rgba(' + this._dominantColor;

			ctx.lineWidth = 2 * RATIO;
			// drawing white gradient for satellite tail
			ctx.strokeStyle = 'rgba(250, 250, 250, 0.05)';
			for (var i = 1; i < 15; i++) {
				ctx.beginPath();
				ctx.arc(x, y, r, 1 + sp, endDeg * i + sp, true);
				ctx.stroke();
			}
			// drawing dominant color gradient for satellite tail
			ctx.strokeStyle = dominantColor + ', 0.4)';
			for (var i = 15; i <= 25; i++) {
				ctx.beginPath();
				ctx.arc(x, y, r, 1 + sp, endDeg * i + sp, true);
				ctx.stroke();
			}
			// drawing satellite
			ctx.lineWidth = 4 * RATIO;
			ctx.strokeStyle = dominantColor + ', 1)';
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.arc(x, y, r, endDeg + 25.89 + sp, endDeg + 25.86 + sp, true);
			ctx.stroke();

			ctx.restore(); // restore clipping region to default
		},
		move: function(delta) {
			this._y += delta;
			this._r = this._calcRadius();
			if (this._y + this._r > GALAXY[4].y || this._y - this._r < GALAXY[0].y) {
				this._offscreen = true;
			} else {
				this._offscreen = false;
			}
		},
		snap: function(direction) {
			var notify = true;
			if (direction === 1) {
				this._pos++;
				if (this._pos === GALAXY.length) {
					this._pos = 0;
					this._offscreen = true;
				} else {
					this._offscreen = false;
				}
			} else if (direction === -1) {
				this._pos--;
				if (this._pos === -1) {
					this._pos = GALAXY.length - 1;
					this._offscreen = true;
				} else {
					this._offscreen = false;
				}
			} else {
				direction *= -1;
				notify = false;
			}

			if (this._offscreen) {
				this._x = GALAXY[this._pos].x;
				this._y = GALAXY[this._pos].y;
				this._r = this._calcRadius();
			} else {
				var x = GALAXY[this._pos].x;
				var y = GALAXY[this._pos].y;
				var r = this._calcRadius();
				this._snap(this._y, x, y, r, direction);
			}

			if (this._pos === 2 && notify) {
				this.emit('planet:selected', this._data);
			}
		},
		_snap: function(oy, x, y, r, direction) {
			if (oy * direction >= (y * direction) - 15 || (!oy && oy !== 0)) {
				this._x = GALAXY[this._pos].x;
				this._y = GALAXY[this._pos].y;
				this._r = this._calcRadius();
				return;
			}
			this._y += direction * 15;
			this._r = this._calcRadius();
			rAF(this._snap.bind(this, this._y, x, y, r, direction));
		},
		_calcRadius: function() {
			var distance = Math.abs(GALAXY[GALAXY_CENTER].y - this._y);
			var r = Math.max(1, MAIN_PLANET_RADIUS
					- parseInt(this._distanceFraction * (distance + 1)));
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

			height = canvas.height = this._coverImg.naturalHeight || this._coverImg.offsetHeight || this._coverImg.height;
			width = canvas.width = this._coverImg.naturalWidth || this._coverImg.offsetWidth || this._coverImg.width;

			ctx.drawImage(this._coverImg, 0, 0);
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
