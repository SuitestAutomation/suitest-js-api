const borderStyle = {
	// apple
	BEZEL: Symbol('bezel'),
	RECTANGLE: Symbol('rectangle'),
	NONE: Symbol('none'),
	ROUNDED: Symbol('rounded'),
	// rest values for hbbtv & browsers
	HIDDEN: Symbol('hidden'),
	DOTTED: Symbol('dotted'),
	DASHED: Symbol('dashed'),
	SOLID: Symbol('solid'),
	DOUBLE: Symbol('double'),
	GROOVE: Symbol('groove'),
	RIDGE: Symbol('ridge'),
	INSET: Symbol('inset'),
	OUTSET: Symbol('outset'),
	INITIAL: Symbol('initial'),
	INHERIT: Symbol('inherit'),
};

Object.freeze(borderStyle);

module.exports = borderStyle;
