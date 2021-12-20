const wsContentTypes = require('../api/wsContentTypes');
const chainPromise = require('../utils/chainPromise');
const {getAppConfigError} = require('../texts');
const SuitestError = require('../utils/SuitestError');

async function getAppConfig({appContext, authContext, webSockets}) {
	const authedContent = await authContext.authorizeWs({
		type: wsContentTypes.getConfiguration,
		configId: appContext._context.configId,
	}, getAppConfig.name);

	const response = await webSockets.send(authedContent);

	if (response.result === 'error') {
		throw new SuitestError(getAppConfigError());
	}

	return response.configuration;
}

module.exports = {
	getAppConfig: chainPromise(getAppConfig),
};
