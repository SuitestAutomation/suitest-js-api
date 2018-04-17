/**
 * Release device command.
 * Notify server that device will no longer be needed.
 * After this method is called interactive or automated minutes stop counting.
 */

const webSockets = require('../api/webSockets');
const wsContentTypes = require('../api/wsContentTypes');
const {authContext, pairedDeviceContext} = require('../context');
const chainPromise = require('../utils/chainPromise');

/**
 * Release paired device
 * @returns {ChainablePromise.<void>}
 */
async function releaseDevice() {
	// authorize
	const authedContent = await authContext.authorizeWs({type: wsContentTypes.releaseDevice}, releaseDevice.name);

	// make ws request
	await webSockets.send(authedContent);

	pairedDeviceContext.clear();
}

module.exports = chainPromise(releaseDevice);
