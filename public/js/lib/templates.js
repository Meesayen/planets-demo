define([
	'lib/text!tpl/display.ect',
	'lib/text!tpl/track-info.ect',
	'lib/text!tpl/playlist.ect',
	'lib/text!tpl/playlist-track.ect'
], function(
	displayTpl,
	trackInfoTpl,
	playlistTpl,
	playlistTrackTpl
) {

	return {
		'display': displayTpl,
		'track-info': trackInfoTpl,
		'playlist': playlistTpl,
		'playlist-track': playlistTrackTpl
	};
});
