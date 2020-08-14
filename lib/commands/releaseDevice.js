/**
 * Release device command.
 * Notify server that device will no longer be needed.
 * After this method is called interactive or automated minutes stop counting.
 */

const wsContentTypes = require('../api/wsContentTypes');
const chainPromise = require('../utils/chainPromise');
const {disconnectedFromDevice, disconnectingFromDevice} = require('../texts');

/**
 * Release paired device
 * @param {Object} instance of main class
 * @returns {ChainablePromise.<void>}
 */
async function releaseDevice({webSockets, authContext, pairedDeviceContext, logger}) {
	logger.delayed(disconnectingFromDevice());
	// authorize
	const authedContent = await authContext.authorizeWs({type: wsContentTypes.releaseDevice}, releaseDevice.name);

	// make ws request
	await webSockets.send(authedContent);

	pairedDeviceContext.clear();
	logger.log(disconnectedFromDevice());
}

module.exports = chainPromise(releaseDevice);
