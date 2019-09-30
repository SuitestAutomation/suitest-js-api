/**
 * Ws event content types
 */

const contentTypes = {
	endTest: 'endTest',
	pairDevice: 'connectDevice',
	releaseDevice: 'releaseDevice',
	startTest: 'startTest',
	selectConfiguration: 'selectConfiguration',
	enableDebugMode: 'enableDebugMode',
	query: 'query',
	eval: 'eval',
	testLine: 'testLine',
};

Object.freeze(contentTypes);

module.exports = contentTypes;
