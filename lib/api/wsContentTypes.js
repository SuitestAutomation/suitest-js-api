/**
 * Ws event content types
 */

const contentTypes = {
	pairDevice: 'connectDevice',
	releaseDevice: 'releaseDevice',
	selectConfiguration: 'selectConfiguration',
	enableDebugMode: 'enableDebugMode',
	query: 'query',
	eval: 'eval',
	testLine: 'testLine',
	takeScreenshot: 'takeScreenshot',
	getConfiguration: 'getConfiguration',
	startRecording: 'startRecording',
	stopRecording: 'stopRecording',
};

Object.freeze(contentTypes);

module.exports = contentTypes;
