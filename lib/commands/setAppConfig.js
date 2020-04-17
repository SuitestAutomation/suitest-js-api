/**
 * Before we can "Open app" or "Open URL" user must define application config.
 * For automated session application config already defined as part of test pack definition.
 * For interactive session it's not defined.
 * Furthermore, it's possible for user to open several apps sequentially, so he should be able to switch app config.
 */
const {validate, validators} = require('../validation');
const wsContentTypes = require('../api/wsContentTypes');
const chainPromise = require('../utils/chainPromise');
const {invalidInputMessage, usingAppConfig, usedAppConfig, useAppConfigOverrides} = require('../texts');

/**
 * Set application config
 * @param {Object} instance of main class
 * @param {string} configId - config Id
 * @param {Object} [configOverride] - an optional override of the configuration
 * @returns {Promise<*>}
 */
async function setAppConfig({appContext, authContext, webSockets, logger}, configId, configOverride = {}) {
	// validate input
	validate(validators.NON_EMPTY_STRING, configId, invalidInputMessage(setAppConfig.name, 'Config id'));
	validate(validators.CONFIG_OVERRIDE, configOverride, invalidInputMessage(setAppConfig.name, 'Config override'));

	logger.delayed(usingAppConfig(configId), 4e3);

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

	logger.log(usedAppConfig(configId));

	if (Object.values(configOverride).length) {
		logger.log(useAppConfigOverrides());
		logger.json(configOverride);
	}
}

module.exports = {
	setAppConfig: chainPromise(setAppConfig),
	setAppConfigUnchained: setAppConfig,
};
