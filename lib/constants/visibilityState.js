/* eslint-disable */

const COLLAPSED = 'collapsed';

const visibilityState = {
	VISIBLE:   'visible',
	INVISIBLE: 'invisible',
	COLLAPSED,
	GONE:      COLLAPSED,
};

Object.freeze(visibilityState);

module.exports = visibilityState;
