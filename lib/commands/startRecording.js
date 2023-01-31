/**
 * Start recording command.
 */

const wsContentTypes = require('../api/wsContentTypes');
const chainPromise = require('../utils/chainPromise');
const {startRecordingMessage} = require('../texts');

/**
 * Start recording
 * @param {SUITEST_API} instance of main class
 * @returns {ChainablePromise.<void>}
 */
async function startRecording({webSockets, authContext, logger}, webhookUrl = '') {
	// authorize
	const authedContent = await authContext.authorizeWs({type: wsContentTypes.startRecording}, webhookUrl);

	// make ws request
	await webSockets.send(authedContent);

	logger.log(startRecordingMessage());
}

module.exports = chainPromise(startRecording);
