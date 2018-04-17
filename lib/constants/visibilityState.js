const COLLAPSED = Symbol('collapsed');

const visibilityState = {
	VISIBLE: Symbol('visible'),
	INVISIBLE: Symbol('invisible'),
	COLLAPSED,
	GONE: COLLAPSED,
};

Object.freeze(visibilityState);

module.exports = visibilityState;
