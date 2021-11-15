const wsContentTypes = require('../api/wsContentTypes');
const chainPromise = require('../utils/chainPromise');
const {getAppConfigRequest, getAppConfigResponse, getAppConfigError} = require('../texts');

async function getAppConfig({appContext, authContext, webSockets, logger}) {
	logger.log(getAppConfigRequest(appContext._context.configId));

	const authedContent = await authContext.authorizeWs({
		type: wsContentTypes.getAppConfig,
		configId: appContext._context.configId,
	}, getAppConfig.name);

	const response = await webSockets.send(authedContent);

	if (response.result === 'error') {
		logger.error(getAppConfigError());

		return undefined;
	}

	logger.log(getAppConfigResponse(response.configuration));

	return response.configuration;
}

module.exports = {
	getAppConfig: chainPromise(getAppConfig),
};
