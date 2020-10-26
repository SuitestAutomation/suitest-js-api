const {makeMethodComposer} = require('../utils/makeComposer');
const SuitestError = require('../utils/SuitestError');
const composers = require('../constants/composer');
const chainPromise = require('../utils/chainPromise');
const {processServerResponse} = require('../utils/socketChainHelper');
const {translateLine} = require('../utils/chainUtils');
const {captureException} = require('../utils/sentry/Raven');
const {connectionNotEstablished} = require('../texts');

// A map to find promise by chain data object
const promiseMap = new WeakMap();

const makeThenComposer = (getSocketMessage, callback, beforeSend) => makeMethodComposer(
	composers.THEN,
	['then'],
	({webSockets, authContext, logger, config}, data, onResolve, onReject) => {
		const chainedPromise = chainPromise(() => {
			let promise;

			if (promiseMap.has(data)) {
				promise = promiseMap.get(data);
			} else {
				const socketMessage = getSocketMessage(data);
				let dataToTranslate = socketMessage;

				if (dataToTranslate.type === 'takeScreenshot') {
					dataToTranslate = {...data};
					delete dataToTranslate.stack;
				}

				beforeSend
					? beforeSend(data)
					: logger.log(translateLine(dataToTranslate, config.logLevel));
				promise = authContext.authorizeWs(socketMessage, data.type)
					.then(() => webSockets.send(socketMessage).then(result => {
						return callback
							? callback(result, data, socketMessage)
							: processServerResponse(logger, config.logLevel)(result, data, socketMessage);
					}, error => {
						return callback
							? callback(error, data, socketMessage)
							: processServerResponse(logger, config.logLevel)(error, data, socketMessage);
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
