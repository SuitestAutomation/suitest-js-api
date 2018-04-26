const state = {
	SELECTED: Symbol('selected'),
	HIGHLIGHTED: Symbol('highlighted'),
	DISABLED: Symbol('disabled'),
	NORMAL: Symbol('normal'),
	APPLICATION: Symbol('application'),
	FOCUSED: Symbol('focused'),
	RESERVED: Symbol('reserved'),
};

Object.freeze(state);

module.exports = state;
