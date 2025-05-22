/**
 * Start recording command.
 */

const wsContentTypes = require('../api/wsContentTypes');
const chainPromise = require('../utils/chainPromise');
const {startRecordingMessage} = require('../texts');

/**
 * Start recording
 * @param {suitest.ISuitest} instance of main class
 * @param {{webhookUrl: string}} [recordingSettings]
 * @returns {Promise<string | undefined>}
 */
async function startRecording({webSockets, authContext, logger}, recordingSettings) {
	const webhookUrl = recordingSettings ? recordingSettings.webhookUrl : undefined;

	// authorize
	const authedContent = await authContext.authorizeWs(
		{
			type: wsContentTypes.startRecording,
			webhookUrl,
		},
	);

	// make ws request
	const response = await webSockets.send(authedContent);

	if (response.result === 'success') {
		logger.log(startRecordingMessage(response.recordingUrl));

		return response.recordingUrl;
	}

	return undefined;
}

module.exports = chainPromise(startRecording);
