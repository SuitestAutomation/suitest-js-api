const {makeModifierComposer} = require('../utils/makeComposer');
const {SUBJ_COMPARATOR, PROP_COMPARATOR} = require('../constants/comparator');
const composers = require('../constants/composer');
const {ELEMENT_PROP} = require('../constants/element');
const VIDEO_STATE = require('../constants/videoState');

const isPlayingComposer = makeModifierComposer(composers.MATCH, ['isPlaying'], (_, data) => ({
	...data,
	comparator: {
		type: SUBJ_COMPARATOR.MATCH,
		props: [{
			name: ELEMENT_PROP.VIDEO_STATE,
			val: VIDEO_STATE.PLAYING,
			type: PROP_COMPARATOR.EQUAL,
		}],
	},
}));

const isStoppedComposer = makeModifierComposer(composers.MATCH, ['isStopped'], (_, data) => ({
	...data,
	comparator: {
		type: SUBJ_COMPARATOR.MATCH,
		props: [{
			name: ELEMENT_PROP.VIDEO_STATE,
			val: VIDEO_STATE.STOPPED,
			type: PROP_COMPARATOR.EQUAL,
		}],
	},
}));

const isPausedComposer = makeModifierComposer(composers.MATCH, ['isPaused'], (_, data) => ({
	...data,
	comparator: {
		type: SUBJ_COMPARATOR.MATCH,
		props: [{
			name: ELEMENT_PROP.VIDEO_STATE,
			val: VIDEO_STATE.PAUSED,
			type: PROP_COMPARATOR.EQUAL,
		}],
	},
}));

module.exports = {
	isPlayingComposer,
	isStoppedComposer,
	isPausedComposer,
};
