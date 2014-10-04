"use strict";
var device = require("../core/utils.es6").device;
var App = require("../ctrl/app.es6")["default"];

var
  doc = document,
  app = new App();

if (device.isChromeMobile && screen.height - 30 > doc.body.clientHeight) {
  var _handleForceFullscreen = function(e) {
    var
      self = e.srcElement || e.target,
      el = doc.docElement,
      rfs = el.requestFullScreen ||
          el.webkitRequestFullScreen ||
          el.mozRequestFullScreen;

    rfs.call(el);
    self.removeEventListener('click', _handleForceFullscreen);
    doc.body.removeChild(self);
    app.run();
  };
  var forceFullscreen = doc.createElement('div');
  forceFullscreen.classList.add('force-fullscreen');
  doc.body.appendChild(forceFullscreen);
  forceFullscreen.addEventListener('click', _handleForceFullscreen);
} else {
  app.run();
}

console.log("Planets Demo\n  Design by Francesco Mastrogiacomo <masterjames@gmail.com>\n  Developed by Federico Giovagnoli <gvg.fede@gmail.com>");