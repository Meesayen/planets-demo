import store from '../core/store.es6';

var SC_CLIENT_ID = 'ed1f33f05cf945d17cbc1be71e1cf991';

var parseDuration = (duration) => {
  var
    m = Math.floor(duration / 60000),
    s = Math.round((duration - 60000 * m) / 1000);
  s = s < 10 ? '0' + s : s;
  return `${m}:${s}`;
};

var parsePlaylistDescription = (description) => {
  var tracks = description.split('\n').map(function(el) {
    return el.split(';').map((chunk) => {
      var
        o = {},
        parts = chunk.split('=');
      o[parts[0]] = parts[1];
      return o;
    }).reduce((cur, next) => {
      var k = Object.keys(next)[0];
      cur[k] = next[k];
      return cur;
    });
  });
  return tracks;
};

class Network {
  constructor() {

  }
  getPlaylist(playlistId) {
    return new Promise((resolve, reject) => {
      store.get('playlist', {
        ':playlistId': playlistId,
        consumer_key: SC_CLIENT_ID
      }).then(data => {
        var
          tracksInfo = parsePlaylistDescription(data.description),
          tracks = data.tracks,
          trackInfo = null,
          _data = [];
        tracks.forEach((track, i) => {
          trackInfo = tracksInfo[i];
          _data.push({
            img: trackInfo.cover,
            duration: parseDuration(track.duration),
            title: trackInfo.title,
            artist: trackInfo.artist,
            album: trackInfo.album,
            streamUrl: track.stream_url + '?consumer_key=' + SC_CLIENT_ID,
            year: track.release_year ||
                track.created_at.slice(0, track.created_at.indexOf('/'))
          });
        });
        resolve(_data);
      }, reject);
    });
  }
  getTracks() {
    return new Promise((resolve, reject) => {
      store.get('tracks', {
        consumer_key: SC_CLIENT_ID,
        filter: 'streamable',
        license: 'to_use_commercially',
        genres: 'electronic'
      }).then(data => {
        var _data = [];
        for (var item of data) {
          _data.push({
            img: item.artwork_url,
            duration: parseDuration(item.duration),
            title: item.title,
            artist: item.user.username,
            album: 'no album',
            streamUrl: item.stream_url + '?consumer_key=' + SC_CLIENT_ID,
            year: item.release_year ||
                item.created_at.slice(0, item.created_at.indexOf('/'))
          });
        }
        resolve(_data);
      }, reject);
    });
  }
  getTrackInfo() {

  }
  getPlaylists() {
    return [{
      id: 1,
      name: 'indie'
    }, {
      id: 2,
      name: 'post-rock'
    }];
  }
  getPlaylistContent(id) {
    if (id === 1) {
      return [{
        img: 'img/clastomatic-moc.jpg',
        duration: '4:50',
        title: 'Annoyance',
        artist: 'Clastomatic',
        album: 'M.O.C',
        year: '2013',
        streamUrl: '/music/clastomatic_annoyance.mp3'
      }, {
        img: 'img/demo-cover-6.jpg',
        duration: '3:14',
        title: 'Mouthful of Diamonds',
        artist: 'Phantogram',
        album: 'Eyelid Movies',
        year: '2010'
      }, {
        img: 'img/demo-cover-2.jpg',
        duration: '3:14',
        title: 'Bethos',
        artist: 'Gifts From Enola',
        album: 'From Fathom',
        year: '2009'
      }, {
        img: 'img/demo-cover-3.jpg',
        duration: '3:14',
        title: 'Odyssey Rescue',
        artist: 'M83',
        album: 'Oblivion EP',
        year: '2013'
      }, {
        img: 'img/demo-cover-4.jpg',
        duration: '3:14',
        title: 'Scar',
        artist: 'Cloud Control',
        album: 'Dream Cave',
        year: '2013'
      }, {
        img: 'img/demo-cover-5.png',
        duration: '3:14',
        title: 'Beat The System',
        artist: '501',
        album: 'Beat The System EP',
        year: '2013'
      }];
    } else {
      return [];
    }
  }
}

var network = new Network();
export default network;
