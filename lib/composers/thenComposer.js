const {makeMethodComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const ws = require('../api/webSockets');
const chainPromise = require('../utils/chainPromise');

// A map to find promise by chain data object
const promiseMap = new WeakMap();

const makeThenComposer = (getSocketMessage, callback) => makeMethodComposer(
	composers.THEN,
	['then'],
	(data, onResolve, onReject) => {
		const chainedPromise = chainPromise(() => {
			let promise;

			if (promiseMap.has(data)) {
				promise = promiseMap.get(data);
			} else {
				const socketMessage = getSocketMessage(data);

				promise = ws.send(socketMessage).then(result => {
					return callback(result, data);
				}, error => {
					return callback(error, data);
				});
				promiseMap.set(data, promise);
			}

			return promise;
		})();

		return chainedPromise.then(onResolve, onReject);
	}, {unregisterParent: true});

module.exports = makeThenComposer;
