/**
 * Ws event content types
 */

const contentTypes = {
	endTest: 'endTest',
	pairDevice: 'connectDevice',
	releaseDevice: 'releaseDevice',
	startTest: 'startTest',
	selectConfiguration: 'selectConfiguration',
};

Object.freeze(contentTypes);

module.exports = contentTypes;
