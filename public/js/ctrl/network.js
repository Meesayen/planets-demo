define([
	'lib/common',
	'lib/promise',
	'lib/class'
], function(
	x,
	Promise,
	Class
) {

	var
		SC_CLIENT_ID = 'e9193c59eb559e44e826e8347fab4b5e',
		SC_BASE_URL = 'https://api.soundcloud.com',
		PLAYLIST_URL = SC_BASE_URL + '/playlists/:playlistId.json',
		TRACKS_URL = SC_BASE_URL + '/tracks.json',
		TRACK_URL = SC_BASE_URL + '/tracks/:trackId.json';

	var resolveRest = function(url, params) {
		for (var k in params) {
			url = url.replace(':' + k, params[k]);
		}
		return url;
	};

	var parseDuration = function(duration) {
		var
			m = Math.floor(duration / 60000),
			s = Math.round((duration - 60000 * m) / 1000);
		s = s < 10 ? '0' + s : s;
		return '' + m + ':' + s;
	};

	var parsePlaylistDescription = function(description) {
		var tracks = description.split('\n').map(function(el) {
			return el.split(',').map(function(chunk) {
				var parts = chunk.split(':');
				var o = {};
				o[parts[0]] = parts[1];
				return o;
			}).reduce(function(cur, next) {
				var k = Object.keys(next)[0];
				cur[k] = next[k];
				return cur;
			});
		});
		return tracks;
	};

	var Network = Class({
		parent: Object,
		constructor: function() {

		},
		getPlaylist: function(playlistId) {
			var p = new Promise();
			x.data.fetch(resolveRest(PLAYLIST_URL, {
				playlistId: playlistId
			}), {
				consumer_key: SC_CLIENT_ID
			}).then(function(data) {
				var
					tracksInfo = parsePlaylistDescription(data.description),
					tracks = data.tracks,
					trackInfo = null,
					_data = [];
				for (var i = 0, track; track = tracks[i]; i++) {
					trackInfo = tracksInfo[i];
					_data.push({
						img: track.artwork_url || track.user.avatar_url,
						duration: parseDuration(track.duration),
						title: trackInfo.title,
						artist: trackInfo.artist,
						album: trackInfo.album,
						streamUrl: track.stream_url + '?consumer_key=' + SC_CLIENT_ID,
						year: track.release_year
							|| track.created_at.slice(0, track.created_at.indexOf('/'))
					});
				}
				p.complete(_data);
			});
			return p;
		},
		getTracks: function() {
			var p = new Promise();
			x.data.fetch(TRACKS_URL, {
				consumer_key: SC_CLIENT_ID,
				filter: 'streamable',
				license: 'to_use_commercially',
				genres: 'electronic'
			}).then(function(data) {
				var _data = [];
				for (var i = 0, item; item = data[i]; i++) {
					_data.push({
						img: item.artwork_url,
						duration: parseDuration(item.duration),
						title: item.title,
						artist: item.user.username,
						album: 'no album',
						streamUrl: item.stream_url + '?consumer_key=' + SC_CLIENT_ID,
						year: item.release_year
							|| item.created_at.slice(0, item.created_at.indexOf('/'))
					});
				}
				p.complete(_data);
			});
			return p;
		},
		getTrackInfo: function() {

		},
		getPlaylists: function() {
			return [{
				id: 1,
				name: 'indie'
			}, {
				id: 2,
				name: 'post-rock'
			}];
		},
		getPlaylistContent: function(id) {
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
				}]
			} else {
				return [];
			}
		}
	});

	return new Network();
});
