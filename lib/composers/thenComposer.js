const {makeMethodComposer} = require('../utils/makeComposer');
const SuitestError = require('../utils/SuitestError');
const composers = require('../constants/composer');
const chainPromise = require('../utils/chainPromise');
const {captureException} = require('../utils/sentry/Raven');
const {connectionNotEstablished} = require('../texts');

// A map to find promise by chain data object
const promiseMap = new WeakMap();

const makeThenComposer = (getSocketMessage, callback, beforeSend) => makeMethodComposer(
	composers.THEN,
	['then'],
	({webSockets, authContext, logger}, data, onResolve, onReject) => {
		const chainedPromise = chainPromise(() => {
			let promise;

			if (promiseMap.has(data)) {
				promise = promiseMap.get(data);
			} else {
				const socketMessage = getSocketMessage(data);

				beforeSend && beforeSend(data);
				promise = authContext.authorizeWs(socketMessage, data.type)
					.then(() => webSockets.send(socketMessage).then(result => {
						return callback(result, data, socketMessage);
					}, error => {
						return callback(error, data, socketMessage);
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
