const borderStyle = {
	BEZEL: Symbol('bezel'),
	RECTANGLE: Symbol('rectangle'),
	NONE: Symbol('none'),
	ROUNDED: Symbol('rounded'),
};

Object.freeze(borderStyle);

module.exports = borderStyle;
