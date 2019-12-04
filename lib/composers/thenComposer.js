const {makeMethodComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const ws = require('../api/webSockets');
const chainPromise = require('../utils/chainPromise');
const {captureException} = require('../utils/sentry/Raven');

// A map to find promise by chain data object
const promiseMap = new WeakMap();

const makeThenComposer = (getSocketMessage, callback, beforeSend) => makeMethodComposer(
	composers.THEN,
	['then'],
	(data, onResolve, onReject) => {
		const chainedPromise = chainPromise(() => {
			let promise;

			if (promiseMap.has(data)) {
				promise = promiseMap.get(data);
			} else {
				const socketMessage = getSocketMessage(data);

				// TODO(SUIT-14049): pass json definition
				beforeSend && beforeSend(data);
				promise = ws.send(socketMessage).then(result => {
					// TODO(SUIT-14049): pass json definition
					return callback(result, data);
				}, error => {
					// TODO(SUIT-14049): pass json definition
					return callback(error, data);
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
