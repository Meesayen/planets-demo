import EventEmitter from '../core/eventemitter.es6';

export default class Player extends EventEmitter {
  constructor() {
    this.root = document.createElement('audio');
    this._source = document.createElement('source');
    this.root.appendChild(this._source);
    this.root.addEventListener('loadeddata', this._sourceLoaded.bind(this));
    this.root.addEventListener('ended', this._playbackEnded.bind(this));
    this.root.addEventListener('pause', this._playbackPaused.bind(this));
    this.root.addEventListener('timeupdate', this._playbackTimeupdate.bind(this));
    // this.root.addEventListener('suspend', this._playbackSuspended.bind(this));
  }
  play() {
    if (this._loaded) {
      this.root.play();
      this.emit('audio:playing');
    }
  }
  pause() {
    if (this._loaded) {
      this.root.pause();
    }
  }
  load(url) {
    this.emit('audio:loading');
    this._loaded = false;
    this._source.src = url;
    this.root.load();
  }
  _sourceLoaded() {
    this._loaded = true;
    this.emit('audio:ready');
  }
  _playbackEnded() {
    this.emit('audio:ended');
  }
  // _playbackSuspended() {
  //  console.log('suspended');
  // },
  // _playbackAborted() {
  //  console.log('aborted');
  // },
  _playbackTimeupdate() {
    if (this.root.duration && this.root.duration - 1 < this.root.currentTime) {
      this._playbackEnded();
    }
  }
  _playbackPaused() {
    this.emit('audio:paused');
  }
}
