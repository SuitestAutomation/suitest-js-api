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
				const socketMessage = getSocketMessage(data);
				let dataToTranslate = socketMessage;
				let snippets;

				if (dataToTranslate.type === 'takeScreenshot') {
					dataToTranslate = {...data};
					delete dataToTranslate.stack;
				} else if (data.type === 'runSnippet') {
					const isInteractiveSession = authContext.isInteractiveSession();
					const {appId, versionId} = appContext.context;
					const {testId} = data;

					snippets = await fetchTestDefinitions({authContext})(
						appId, versionId, testId, isInteractiveSession, data.stack);
				}

				if (beforeSend) {
					beforeSend(data);
				} else {
					const translation = translateLine(dataToTranslate, config.testLines || config.logLevel);

					if (translation) {
						logger.log(translation);
					}
				}
				promise = authContext.authorizeWs(socketMessage, data.type)
					.then(() => webSockets.send(socketMessage).then(result => {
						return callback
							? callback(result, data, socketMessage)
							: processServerResponse(
								logger,
								{
									logLevel: config.logLevel,
									testLines: config.testLines,
									testErrors: config.testError,
								})(result, data, socketMessage, snippets);
					}, error => {
						return callback
							? callback(error, data, socketMessage)
							: processServerResponse(
								logger,
								{
									logLevel: config.logLevel,
									testLines: config.testLines,
									testErrors: config.testErrors,
								})(error, data, socketMessage, snippets);
					}))
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
