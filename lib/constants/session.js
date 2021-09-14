/* eslint-disable key-spacing */

/**
 * Session type constants
 */

const sessionConstants = {
	// TODO: remove
	AUTOMATED:    Symbol('sessionAutomated'),
	// TODO: remove
	INTERACTIVE:  Symbol('sessionInteractive'),
	GUEST:        Symbol('sessionGuest'),
	TOKEN:        Symbol('sessionToken'),
};

Object.freeze(sessionConstants);

module.exports = sessionConstants;
