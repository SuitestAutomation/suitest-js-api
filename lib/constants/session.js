/* eslint-disable key-spacing */

/**
 * Session type constants
 */

const sessionConstants = {
	GUEST:        Symbol('sessionGuest'),
	TOKEN:        Symbol('sessionToken'),
};

Object.freeze(sessionConstants);

module.exports = sessionConstants;
