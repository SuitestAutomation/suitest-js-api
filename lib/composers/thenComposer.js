const {makeMethodComposer} = require('../utils/makeComposer');
const SuitestError = require('../utils/SuitestError');
const composers = require('../constants/composer');
const chainPromise = require('../utils/chainPromise');
const {fetchTestDefinitions} = require('../utils/chainUtils');
const {processServerResponse} = require('../utils/socketChainHelper');
const {translateLine} = require('../utils/chainUtils');
const {captureException} = require('../utils/sentry/Raven');
const {connectionNotEstablished} = require('../texts');

// A map to find promise by chain data object
const promiseMap = new WeakMap();

const makeThenComposer = (getSocketMessage, callback, beforeSend) => makeMethodComposer(
	composers.THEN,
	['then'],
	({webSockets, authContext, logger, config, appContext}, data, onResolve, onReject) => {
		const chainedPromise = chainPromise(async() => {
			let promise;

			if (promiseMap.has(data)) {
				promise = promiseMap.get(data);
			} else {
				/** @type {Object | [Object, Buffer]} */
				const message = await getSocketMessage(data);
				const withBinaryData = Array.isArray(message);
				const jsonSocketMessage = withBinaryData ? message[0] : message;

				let dataToTranslate = jsonSocketMessage;
				let snippets;

				if (dataToTranslate.type === 'takeScreenshot' || dataToTranslate.type === 'lastScreenshot') {
					dataToTranslate = {...data};
					delete dataToTranslate.stack;
				} else if (data.type === 'runSnippet') {
					const {appId, versionId} = appContext.context;
					const {testId} = data;

					snippets = await fetchTestDefinitions({authContext})(
						appId, versionId, testId, config.includeChangelist, data.stack);
				}

				if (beforeSend) {
					beforeSend(data);
				} else {
					const translation = translateLine(dataToTranslate, config.logLevel);

					if (translation) {
						logger.log(translation);
					}
				}

				promise = authContext.authorizeWs(jsonSocketMessage, data.type)
					.then(() => {
						const defaultResponseHandler = processServerResponse(logger, config.logLevel);

						return webSockets.send(message).then(result => {
							return callback
								? callback(result, data, jsonSocketMessage)
								: defaultResponseHandler(result, data, jsonSocketMessage, snippets);
						}, error => {
							return callback
								? callback(error, data, jsonSocketMessage)
								: defaultResponseHandler(error, data, jsonSocketMessage, snippets);
						});
					})
					.catch(err => {
						if (err instanceof SuitestError && err.code === SuitestError.AUTH_NOT_ALLOWED) {
							logger.error(connectionNotEstablished());
						}

						return Promise.reject(err);
					});
				promiseMap.set(data, promise);
			}

			return promise;
		})();

		return chainedPromise.then(onResolve, async(err) => {
			await captureException(err);

			return onReject && onReject(err);
		});
	}, {unregisterParent: true});

module.exports = makeThenComposer;
