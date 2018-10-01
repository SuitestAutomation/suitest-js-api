/**
 * Release device command.
 * Notify server that device will no longer be needed.
 * After this method is called interactive or automated minutes stop counting.
 */

const webSockets = require('../api/webSockets');
const wsContentTypes = require('../api/wsContentTypes');
const {authContext, pairedDeviceContext} = require('../context');
const chainPromise = require('../utils/chainPromise');
const {disconnectedFromDevice, disconnectingFromDevice} = require('../texts');
const logger = require('../utils/logger');

/**
 * Release paired device
 * @returns {ChainablePromise.<void>}
 */
async function releaseDevice() {
	logger.delayed(disconnectingFromDevice());
	// authorize
	const authedContent = await authContext.authorizeWs({type: wsContentTypes.releaseDevice}, releaseDevice.name);

	// make ws request
	await webSockets.send(authedContent);

	pairedDeviceContext.clear();
	logger.log(disconnectedFromDevice());
}

module.exports = chainPromise(releaseDevice);
