const contentMode = {
	SCALE_TO_FILL: Symbol('scaleToFill'),
	SCALE_ASPECT_FIT: Symbol('scaleAspectFit'),
	SCALE_ASPECT_FILL: Symbol('scaleAspectFill'),
	REDRAW: Symbol('redraw'),
	CENTER: Symbol('center'),
	TOP: Symbol('top'),
	BOTTOM: Symbol('bottom'),
	BOTTOM_LEFT: Symbol('bottomLeft'),
	BOTTOM_RIGHT: Symbol('bottomRight'),
	LEFT: Symbol('left'),
	RIGHT: Symbol('right'),
	TOP_LEFT: Symbol('topLeft'),
	TOP_RIGHT: Symbol('topRight'),
};

Object.freeze(contentMode);

module.exports = contentMode;
