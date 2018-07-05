const {registerLeaf, unregisterLeaf} = require('./unusedExpressionWatchers');

/**
 * Helper to make a composer for a method, that applies modifications to meta and returns new chain
 * @param {symbol} type - type of the composer. It's useful for debugging and unit test. Otherwise it's not identifiable
 * @param {Array<string>} names
 * @param {Function} applyModifier
 * @param {boolean} [configurable] - is field configurable
 * @param {boolean} [writable] - is field writable
 * @param {boolean} [enumerable] - is field enumerable
 * @param {boolean} [registerClone] - should new chain be registered into unused expressions watcher
 * @param {boolean} [unregisterParent] - should parent chain be removed from unused expressions watcher
 */
const makeModifierComposer = (type, names, applyModifier, {
	configurable = false,
	writable = false,
	enumerable = true,
	registerClone = true,
	unregisterParent = true,
} = {}) => {
	const composer = (data, chain, makeChain) =>
		names.reduce((acc, name) => ({
			...acc,
			[name]: {
				value: (...args) => {
					const newChain = makeChain(applyModifier(data, ...args));

					unregisterParent && unregisterLeaf(chain);
					registerClone && registerLeaf(newChain, data.stack);

					return newChain;
				},
				configurable,
				writable,
				enumerable,
			},
		}), {});

	composer.composerType = type;

	return composer;
};

/**
 * Helper to make a composer for a method, that simply calls provided callback and returns appropriate values
 * @param {symbol} type - type of the composer. It's useful for debugging and unit test. Otherwise it's not identifiable
 * @param {Array<string>} names
 * @param {Function} callback
 * @param {boolean} [configurable] - is field configurable
 * @param {boolean} [writable] - is field writable
 * @param {boolean} [enumerable] - is field enumerable
 * @param {boolean} [unregisterParent]
 */
const makeMethodComposer = (type, names, callback, {
	configurable = false,
	writable = false,
	enumerable = true,
	unregisterParent = false,
} = {}) => {
	const composer = (data, chain) =>
		names.reduce((acc, name) => ({
			...acc,
			[name]: {
				value: (...args) => {
					unregisterParent && unregisterLeaf(chain);

					return callback(data, ...args);
				},
				configurable,
				writable,
				enumerable,
			},
		}), {});

	composer.composerType = type;

	return composer;
};

module.exports = {
	makeMethodComposer,
	makeModifierComposer,
};
