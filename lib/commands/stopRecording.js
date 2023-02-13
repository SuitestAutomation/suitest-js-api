/**
 * Stop recording command.
 */

const wsContentTypes = require('../api/wsContentTypes');
const chainPromise = require('../utils/chainPromise');
const {stopRecordingMessage} = require('../texts');

/**
 * Stop recording
 * @param {SUITEST_API} instance of main class
 * @returns {ChainablePromise.<void>}
 */
async function stopRecording({webSockets, authContext, logger}, recordingSettings) {
	const discard = recordingSettings ? recordingSettings.discard : false;

	// authorize
	const authedContent = await authContext.authorizeWs(
		{
			type: wsContentTypes.stopRecording,
			discard,
		},
	);

	// make ws request
	await webSockets.send(authedContent);

	logger.log(stopRecordingMessage());
}

module.exports = chainPromise(stopRecording);
