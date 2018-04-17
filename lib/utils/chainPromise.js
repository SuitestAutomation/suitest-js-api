let currentPromise = Promise.resolve();

/**
 * Callback for `chainPromise` function
 *
 * @callback chainPromiseCallback
 * @param {*} args
 * @return {Promise<*>}
 */

/**
 * Only keep one Promise in chain, always refer to it when next promise has to be chained
 * @param {chainPromiseCallback} callback
 * @returns {function}
 */
const chainPromise = callback => (...args) => {
	const wrappedCallback = () => callback(...args);

	currentPromise = currentPromise.then(wrappedCallback, wrappedCallback);

	return currentPromise;
};

module.exports = chainPromise;
