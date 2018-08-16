/* eslint-disable */

const ENTER  = 'ENTER',
	  BACK   = 'BACK',

	  LEFT   = 'LEFT',
	  RIGHT  = 'RIGHT',
	  UP     = 'UP',
	  DOWN   = 'DOWN',

	  BLUE   = 'BLUE',
	  YELLOW = 'YELLOW';

/**
 * VRC key code constants
 */
const vrcConstants = {
	// Default VRC
	ENTER,
	OK: ENTER,

	UP,
	DOWN,
	LEFT,
	RIGHT,
	BACK,
	RED:        'RED',
	GREEN:      'GREEN',
	YELLOW,
	BLUE,
	NUM_0:      '0',
	NUM_1:      '1',
	NUM_2:      '2',
	NUM_3:      '3',
	NUM_4:      '4',
	NUM_5:      '5',
	NUM_6:      '6',
	NUM_7:      '7',
	NUM_8:      '8',
	NUM_9:      '9',
	FAST_FWD:   'FAST_FWD',
	REWIND:     'REWIND',
	STOP:       'STOP',
	PLAY:       'PLAY',
	PAUSE:      'PAUSE',
	PLAY_PAUSE: 'PLAY_PAUSE',
	RECORD:     'RECORD',
	VOL_UP:     'VOL_UP',
	VOL_DOWN:   'VOL_DOWN',
	MUTE:       'MUTE',
	SETTINGS:   'SETTINGS',
	TELETEXT:   'TELETEXT',
	MENU:       'MENU',
	SOURCE:     'SOURCE',
	SMART:      'SMART',
	GUIDE:      'GUIDE',
	EXIT:       'EXIT',
	POWER:      'POWER',
	CH_UP:      'CH_UP',
	CH_DOWN:    'CH_DOWN',

	// xBox extra
	A:                       'A',
	B:                       'B',
	X:                       'X',
	Y:                       'Y',
	LEFT_TRIGGER:            'LEFT_TRIGGER',
	RIGHT_TRIGGER:           'RIGHT_TRIGGER',
	LEFT_BUMPER:             'LEFT_BUMPER',
	RIGHT_BUMPER:            'RIGHT_BUMPER',
	LEFT_THUMBSTICK_LEFT:    'LEFT_THUMBSTICK_LEFT',
	LEFT_THUMBSTICK_RIGHT:   'LEFT_THUMBSTICK_RIGHT',
	LEFT_THUMBSTICK_UP:      'LEFT_THUMBSTICK_UP',
	LEFT_THUMBSTICK_DOWN:    'LEFT_THUMBSTICK_DOWN',
	LEFT_THUMBSTICK_BUTTON:  'LEFT_THUMBSTICK_BUTTON',
	RIGHT_THUMBSTICK_LEFT:   'RIGHT_THUMBSTICK_LEFT',
	RIGHT_THUMBSTICK_RIGHT:  'RIGHT_THUMBSTICK_RIGHT',
	RIGHT_THUMBSTICK_UP:     'RIGHT_THUMBSTICK_UP',
	RIGHT_THUMBSTICK_DOWN:   'RIGHT_THUMBSTICK_DOWN',
	RIGHT_THUMBSTICK_BUTTON: 'RIGHT_THUMBSTICK_BUTTON',
	D_PAD_RIGHT:             'D_PAD_RIGHT',
	D_PAD_LEFT:              'D_PAD_LEFT',
	D_PAD_DOWN:              'D_PAD_DOWN',
	D_PAD_UP:                'D_PAD_UP',
	VIEW:                    'VIEW',
	HOME:                    'HOME', // also for: apple tv

	// apple tv
	SELECT: ENTER,
};

Object.freeze(vrcConstants);

module.exports = vrcConstants;
