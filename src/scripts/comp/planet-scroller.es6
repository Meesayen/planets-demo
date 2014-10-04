/*!
 * Copyright 2013, Federico Giovagnoli <mailto:gvg.fede@gmail.com>
 * Released under the MIT license
 */

import EventEmitter from '../core/eventemitter.es6';
import { cache, device } from '../core/utils.es6';

var
  MOBILE = device.isMobile,
  TOUCH_START_EVT = 'ontouchstart' in window ? 'touchstart' : 'mousedown',
  TOUCH_END_EVT = 'ontouchend' in window ? 'touchend' : 'mouseup',
  TOUCH_MOVE_EVT = 'ontouchmove' in window ? 'touchmove' : 'mousemove',
  SCREEN_WIDTH = MOBILE ? screen.availWidth : 320,
  SCREEN_HEIGHT = MOBILE ? screen.availHeight : 495,
  PI2 = Math.PI * 2,
  DEG_UNIT = Math.PI / 180,

  // Galaxy Constants
  GALAXY_CANVAS_HEIGHT = SCREEN_HEIGHT - 50 - 80,
  // GALAXY_OFFSCREEN_Y = 215,
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
      return context.webkitBackingStorePixelRatio ||
          context.mozBackingStorePixelRatio ||
          context.msBackingStorePixelRatio ||
          context.oBackingStorePixelRatio ||
          context.backingStorePixelRatio ||
          1;
    })();
    return devicePixelRatio / backingStoreRatio;
  })();

if (!MOBILE) {
  RATIO = 2; // Debug
}

var
  RING_IMG = document.createElement('img'),
  ringImgSrc = cache.get('ring-img-src');
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
      cache.set('ring-img-src', RING_IMG.src);
    };
    img.src = 'img/ring.png';
  })();
}


class Planet extends EventEmitter {
  constructor(o) {
    var
      oc = this._satOffCanvas = document.createElement('canvas'),
      pos = this._pos = o.position;

    oc.width = RING_IMG.width;
    oc.height = RING_IMG.height;
    this._imgReady = false;
    this._model = null;
    this.index = 0;
    this._deg = Math.floor(Math.random() * 360);
    this._satOffCtx = oc.getContext('2d');

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
        gradient = ctx.createLinearGradient(0, 0, dim, dim),
        dominantColor = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
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
  }

  get offset() {
    return this._y - GALAXY[this._pos].y;
  }
  get position() {
    return this._pos;
  }

  get model() {
    return this._model;
  }
  set model(newModel) {
    if (this._model) {
      var d = (RING_IMG.width / 2);
      this._dominantColor = null;
      this._satOffCtx.translate(-d, -d);
    }
    this._model = newModel;
    this._refresh();
  }

  _refresh() {
    this._coverImg.src = this._model.img;
    if (this._pos === 2) {
      this.emit('planet:selected', this.index);
    }
  }
  draw(ctx) {
    var
      me = this,
      r = me._r * RATIO,
      x = me._x * RATIO,
      y = me._y * RATIO,
      dx = (me._x - me._r) * RATIO,
      dy = (me._y - me._r) * RATIO,
      imgDim = r * 2;

    if (this._offscreen) {
      return;
    }

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
  }

  // Drawing the satellite using a cached image and rotating the canvas.
  // Better performance on Chrome for Android: ~20 FPS
  // Slightly worse performance on Chrome Desktop: ~55 FPS
  _drawSatelliteWithImage(ctx, x, y, r) {
    if (!RING_IMG || !this._dominantColor) {
      return;
    }

    if (this._model.playing) {
      this._deg++;
    }

    var
      _ctx = this._satOffCtx,
      deg = this._deg,
      dim = RING_IMG.width,
      halfDim = dim / 2,
      rd = (dim  * r) / halfDim + 20,
      halfRd = rd / 2;

    if (deg > 360) {
      deg = this._deg = 0;
    }

    _ctx.save();
    _ctx.rotate(deg*DEG_UNIT);
    _ctx.drawImage(this._ringImg, -halfDim, -halfDim);
    _ctx.restore();
    ctx.drawImage(this._satOffCanvas, x - halfRd, y - halfRd, rd, rd);
  }
  // Drawing the satellite programmatically.
  // Best performance on Chrome Desktop: +80 FPS
  // Worst performance on Chrome for Android: <15 FPS
  _drawSatellite(ctx, x, y, r) {
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
  }
  move(delta) {
    this._y += delta;
    this._r = this._calcRadius();
    if (this._y + this._r > GALAXY[4].y || this._y - this._r < GALAXY[0].y) {
      this._offscreen = true;
    } else {
      this._offscreen = false;
    }
  }
  snap(direction) {
    var changed = true;
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
      changed = false;
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

    if (this._pos === 2 && changed) {
      this.emit('planet:selected', this.index);
    }
  }
  _snap(oy, x, y, r, direction) {
    if (oy * direction >= (y * direction) - 15 || (!oy && oy !== 0)) {
      this._x = GALAXY[this._pos].x;
      this._y = GALAXY[this._pos].y;
      this._r = this._calcRadius();
      return;
    }
    this._y += direction * 15;
    this._r = this._calcRadius();
    requestAnimationFrame(this._snap.bind(this, this._y, x, y, r, direction));
  }
  _calcRadius() {
    var distance = Math.abs(GALAXY[GALAXY_CENTER].y - this._y);
    var r = Math.max(1, MAIN_PLANET_RADIUS -
        parseInt(this._distanceFraction * (distance + 1)));
    return r;
  }
  _calcDominantColor() {
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
}


export default class PlanetScroller extends EventEmitter {
  constructor() {
    this._model = [];
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
  }

  get root() {
    return this._root;
  }
  get model() {
    return this._model;
  }
  set model(newModel) {
    this._model = newModel;
    this._refresh();
  }

  draw() {
    var c = this._root;
    this._draw(c, this._ctx, c.width, c.height, this._planets, this._mask);
  }
  update() {
    this._update();
    requestAnimationFrame(this.update.bind(this));
  }
  toggleAnimation(forcePlay = false) {
    if (forcePlay === true) {
      this._pauseDraw = false;
    } else {
      this._pauseDraw = !this._pauseDraw;
    }
  }
  next() {
    var
      pos = 4,
      index = this._tail;
    this._shiftIndex();
    this._planets.forEach(p => {
      p.snap(-1);
      if (p.position === pos) {
        p.model = this._model[index];
        p.index = index;
      }
    });
  }
  _createPlanets() {
    if (!RING_IMG.src) {
      requestAnimationFrame(this._createPlanets.bind(this));
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
    this._planets.forEach(p => {
      p.on('planet:selected', this._onPlanetSelection.bind(this));
    });
    this._refresh();
    this._pauseDraw = false;
  }
  _refresh() {
    if (this._model && this._model[0]) {
      var
        modelLen = this.model.length,
        p = null;
      this._head = 0;
      this._tail = 0;
      for (var i = 0; i < 3; i++) {
        p = this._planets[i];
        p.model = this._model[this._tail];
        p.index = this._tail;
        this._tail = this._calculateIndex(this._tail, 1, modelLen, 0);
      }
      for (var i = 3; i < 5; i++) {
        this._head = this._calculateIndex(this._head, -1, -1, modelLen - 1);
        p = this._planets[i];
        p.model = this._model[this._head];
        p.index = this._head;
      }
      this._head = this._calculateIndex(this._head, -1, -1, modelLen - 1);
    }
  }
  _draw(canvas, ctx, w, h, planets, mask) {
    this.__draw(canvas, ctx, w, h, planets, mask);
    requestAnimationFrame(this._draw.bind(this, canvas, ctx, w, h, planets, mask));
  }
  __draw(canvas, ctx, w, h, planets, mask) {
    if (this._pauseDraw) {
      return;
    }
    canvas.width = w;
    _planets.forEach(p => {
      p.draw(ctx);
    });
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0, w, h);
  }
  _update() {
    if (!this._deltaPlanetMovement || this._pauseDraw) {
      return;
    }
    this._planets.forEach(p => {
      p.move(this._deltaPlanetMovement);
    });
    this._deltaPlanetMovement = 0;
  }
  _onMove(e) {
    e.preventDefault();
    if (!this._moveEnabled) {
      return;
    }
    this._deltaPlanetMovement = e.webkitMovementY;
    if (e.touches) {
      this._deltaPlanetMovement = -(this._touchY - e.touches[0].pageY);
      this._touchY = e.touches[0].pageY;
    }
  }
  _onHoldClick(e) {
    // e.preventDefault();
    this._moveEnabled = true;
    if (e.touches) {
      this._touchY = e.touches[0].pageY;
      this._startY = e.touches[0].pageY;
    } else {
      this._startY = e.pageY;
    }
  }
  _onReleaseClick(e) {
    var
      endY = e.changedTouches ? e.changedTouches[0].pageY : e.pageY,
      direction = this._planets[2].offset > 0 ? 1 : -1,
      delta = Math.abs(this._startY - endY),
      pos, index;
    this._deltaPlanetMovement = 0;
    this._moveEnabled = false;
    if (delta < 55) {
      direction *= 1.1;
      if (delta < 5) {
        this.emit('planet:clicked');
      }
    }

    if (direction === 1) {
      pos = 0;
      index = this._head;
      this._unshiftIndex();
    } else if (direction === -1) {
      pos = 4;
      index = this._tail;
      this._shiftIndex();
    }
    this._planets.forEach(p => {
      p.snap(direction);
      if (p.position === pos) {
        p.model = this._model[index];
        p.index = index;
      }
    });
  }
  _shiftIndex() {
    var modelLen = this._model.length;
    this._head = this._calculateIndex(this._head, 1, modelLen, 0);
    this._tail = this._calculateIndex(this._tail, 1, modelLen, 0);
  }
  _unshiftIndex() {
    var modelLen = this._model.length;
    this._head = this._calculateIndex(this._head, -1, -1, modelLen - 1);
    this._tail = this._calculateIndex(this._tail, -1, -1, modelLen - 1);
  }
  _calculateIndex(index, step, limit, fallback) {
    index += step;
    if (index === limit) {
      index = fallback;
    }
    return index;
  }
  _onPlanetSelection(idx) {
    this.emit('planet:selected', idx);
  }
  _calculateGalaxyPoints() {
    var
      galaxyCenterX = SCREEN_WIDTH / 2,
      galaxyCenterY = GALAXY_CANVAS_HEIGHT / 2,
      radius = GALAXY_CANVAS_HEIGHT / 5 * 3,
      secondaryPlanetRadius, distanceFromMainPlanet;

    MAIN_PLANET_RADIUS = (radius > SCREEN_WIDTH ?
        SCREEN_WIDTH - 30 : radius) / 2;
    secondaryPlanetRadius = Math.round(MAIN_PLANET_RADIUS *
        SECONDARY_PLANET_SMALLNESS / 100);
    distanceFromMainPlanet = MAIN_PLANET_RADIUS +
        secondaryPlanetRadius + PLANETS_MARGIN;

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
    }];
  }
}
