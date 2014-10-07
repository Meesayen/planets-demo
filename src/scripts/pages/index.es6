import { device } from '../core/utils.es6';
import App from '../ctrl/app.es6';

var
  doc = document,
  app = new App();

if (device.isChromeMobile && screen.height - 30 > doc.body.clientHeight) {
  var _handleForceFullscreen = (e) => {
    var
      self = e.srcElement || e.target,
      rfs = self.requestFullScreen ||
          self.webkitRequestFullScreen ||
          self.mozRequestFullScreen;

    rfs.call(self);
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

console.log(`Planets Demo
  Design by Francesco Mastrogiacomo <masterjames@gmail.com>
  Developed by Federico Giovagnoli <gvg.fede@gmail.com>`);
