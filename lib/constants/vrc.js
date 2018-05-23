/* eslint-disable key-spacing */

const ENTER = Symbol('ENTER'),
	BACK = Symbol('BACK'),

	LEFT = Symbol('LEFT'),
	RIGHT = Symbol('RIGHT'),
	UP = Symbol('UP'),
	DOWN = Symbol('DOWN'),

	BLUE = Symbol('BLUE'),
	YELLOW = Symbol('YELLOW');

/**
 * VRC key code constants
 */
const vrcConstants = {
	// Default VRC
	ENTER,
	OK          : ENTER,

	UP,
	DOWN,
	LEFT,
	RIGHT,
	BACK,
	RED         : Symbol('RED'),
	GREEN       : Symbol('GREEN'),
	YELLOW,
	BLUE,
	NUM_0       : Symbol('0'),
	NUM_1       : Symbol('1'),
	NUM_2       : Symbol('2'),
	NUM_3       : Symbol('3'),
	NUM_4       : Symbol('4'),
	NUM_5       : Symbol('5'),
	NUM_6       : Symbol('6'),
	NUM_7       : Symbol('7'),
	NUM_8       : Symbol('8'),
	NUM_9       : Symbol('9'),
	FAST_FWD    : Symbol('FAST_FWD'),
	REWIND      : Symbol('REWIND'),
	STOP        : Symbol('STOP'),
	PLAY        : Symbol('PLAY'),
	PAUSE       : Symbol('PAUSE'),
	PLAY_PAUSE  : Symbol('PLAY_PAUSE'),
	RECORD      : Symbol('RECORD'),
	VOL_UP      : Symbol('VOL_UP'),
	VOL_DOWN    : Symbol('VOL_DOWN'),
	MUTE        : Symbol('MUTE'),
	SETTINGS    : Symbol('SETTINGS'),
	TELETEXT    : Symbol('TELETEXT'),
	MENU        : Symbol('MENU'),
	SOURCE      : Symbol('SOURCE'),
	SMART       : Symbol('SMART'),
	GUIDE       : Symbol('GUIDE'),
	EXIT        : Symbol('EXIT'),
	POWER       : Symbol('POWER'),
	CH_UP       : Symbol('CH_UP'),
	CH_DOWN     : Symbol('CH_DOWN'),

	// xBox extra
	A                       : Symbol('A'),
	B                       : Symbol('B'),
	X                       : Symbol('X'),
	Y                       : Symbol('Y'),
	LEFT_TRIGGER            : Symbol('LEFT_TRIGGER'),
	RIGHT_TRIGGER           : Symbol('RIGHT_TRIGGER'),
	LEFT_BUMPER             : Symbol('LEFT_BUMPER'),
	RIGHT_BUMPER            : Symbol('RIGHT_BUMPER'),
	LEFT_THUMBSTICK_LEFT    : Symbol('LEFT_THUMBSTICK_LEFT'),
	LEFT_THUMBSTICK_RIGHT   : Symbol('LEFT_THUMBSTICK_RIGHT'),
	LEFT_THUMBSTICK_UP      : Symbol('LEFT_THUMBSTICK_UP'),
	LEFT_THUMBSTICK_DOWN    : Symbol('LEFT_THUMBSTICK_DOWN'),
	LEFT_THUMBSTICK_BUTTON  : Symbol('LEFT_THUMBSTICK_BUTTON'),
	RIGHT_THUMBSTICK_LEFT   : Symbol('RIGHT_THUMBSTICK_LEFT'),
	RIGHT_THUMBSTICK_RIGHT  : Symbol('RIGHT_THUMBSTICK_RIGHT'),
	RIGHT_THUMBSTICK_UP     : Symbol('RIGHT_THUMBSTICK_UP'),
	RIGHT_THUMBSTICK_DOWN   : Symbol('RIGHT_THUMBSTICK_DOWN'),
	RIGHT_THUMBSTICK_BUTTON : Symbol('RIGHT_THUMBSTICK_BUTTON'),
	DPAD_RIGHT              : Symbol('DPAD_RIGHT'),
	DPAD_LEFT               : Symbol('DPAD_LEFT'),
	DPAD_DOWN               : Symbol('DPAD_DOWN'),
	DPAD_UP                 : Symbol('DPAD_UP'),
	VIEW                    : Symbol('VIEW'),
	HOME                    : Symbol('HOME'), // also for: apple tv

	// apple tv
	SELECT                  : ENTER,
};

Object.freeze(vrcConstants);

module.exports = vrcConstants;
