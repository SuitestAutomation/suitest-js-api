const {mergeAll} = require('ramda');
const {wrapThrow} = require('./sentry/Raven');
const {registerLeaf} = require('./unusedExpressionWatchers');

const makeChain = (instance, getComposers, data) => {
	const makeNewChain = wrapThrow(updatedData => {
		const composers = getComposers(updatedData);
		const chain = {};

		// refresh stack every time a new method is called on the chain.
		updatedData.stack = Error().stack;

		Object.defineProperties(chain, mergeAll(
			composers.map(composer => composer(instance, updatedData, chain, makeNewChain)))
		);

		return chain;
	});

	const chain = makeNewChain(data);

	registerLeaf(chain, data.stack);

	return chain;
};

module.exports = makeChain;
