const videoState = {
	STOPPED: Symbol('stopped'),
	ERROR: Symbol('error'),
	PLAYING: Symbol('playing'),
	PAUSED: Symbol('paused'),
	CONNECTING: Symbol('connecting'),
	BUFFERING: Symbol('buffering'),
	FINISHED: Symbol('finished'),
	IDLE: Symbol('idle'),
	PREPARING: Symbol('preparing'),
	PREPARED: Symbol('prepared'),
	PLAYBACK_COMPLETED: Symbol('playback_completed'),
	UNKNOWN: Symbol('unknown'),
	REVERSING: Symbol('reversing'),
};

Object.freeze(videoState);

module.exports = videoState;
