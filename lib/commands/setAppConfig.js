/**
 * Before we can "Open app" or "Open URL" user must define application config.
 * For automated session application config already defined as part of test pack definition.
 * For interactive session it's not defined.
 * Furthermore, it's possible for user to open several apps sequentially, so he should be able to switch app config.
 */

const {appContext, authContext} = require('../context');
const {validate, validators} = require('../validataion');
const wsContentTypes = require('../api/wsContentTypes');
const webSockets = require('../api/webSockets');
const chainPromise = require('../utils/chainPromise');
const {invalidInputMessage, commandExecuted, commandWillBeExecuted} = require('../texts');
const logger = require('../utils/logger');

/**
 * Set application config
 * @param {string} configId - config Id
 * @param {Object} [configOverride] - an optional override of the configuration
 * @returns {Promise<*>}
 */
async function setAppConfig(configId, configOverride = {}) {
	logger.info(commandWillBeExecuted('setAppConfig ' + configId));
	// validate input
	validate(validators.NON_EMPTY_STRING, configId, invalidInputMessage(setAppConfig.name, 'Config id'));
	validate(validators.CONFIG_OVERRIDE, configOverride, invalidInputMessage(setAppConfig.name, 'Config override'));

	// authorize
	const authedContent = await authContext.authorizeWs({
		type: wsContentTypes.selectConfiguration,
		configId,
		configOverride,
	}, setAppConfig.name);

	// make ws request
	await webSockets.send(authedContent);

	// set app context
	appContext.setContext({
		configId,
		configOverride,
	});
	logger.info(commandExecuted('setAppConfig ' + configId));
}

module.exports = {
	setAppConfig: chainPromise(setAppConfig),
	setAppConfigUnchained: setAppConfig,
};
