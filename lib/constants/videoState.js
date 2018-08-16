/* eslint-disable */

const videoState = {
	STOPPED:            'stopped',
	ERROR:              'error',
	PLAYING:            'playing',
	PAUSED:             'paused',
	CONNECTING:         'connecting',
	BUFFERING:          'buffering',
	FINISHED:           'finished',
	IDLE:               'idle',
	PREPARING:          'preparing',
	PREPARED:           'prepared',
	PLAYBACK_COMPLETED: 'playbackCompleted',
	UNKNOWN:            'unknown',
	REVERSING:          'reversing',
};

Object.freeze(videoState);

module.exports = videoState;
