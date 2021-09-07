/* eslint-disable key-spacing */

/**
 * Session type constants
 */

const sessionConstants = {
	AUTOMATED:    Symbol('sessionAutomated'),
	INTERACTIVE:  Symbol('sessionInteractive'),
	ACCESS_TOKEN: Symbol('sessionAccessToken'),
	GUEST:        Symbol('sessionGuest'),
	TOKEN:        Symbol('sessionToken'),
};

Object.freeze(sessionConstants);

module.exports = sessionConstants;
