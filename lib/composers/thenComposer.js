const {makeMethodComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const chainPromise = require('../utils/chainPromise');
const {captureException} = require('../utils/sentry/Raven');

// A map to find promise by chain data object
const promiseMap = new WeakMap();

const makeThenComposer = (getSocketMessage, callback, beforeSend) => makeMethodComposer(
	composers.THEN,
	['then'],
	({webSockets, authContext}, data, onResolve, onReject) => {
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
					}));
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
