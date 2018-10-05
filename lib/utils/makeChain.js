const {mergeAll} = require('ramda');
const {wrapThrow} = require('./sentry/Raven');
const {stripSuitestCodeFromStack, stripAbsolutePaths} = require('./stackTraceParser');

const makeChain = (getComposers, data) => {
	const makeNewChain = wrapThrow(updatedData => {
		const composers = getComposers(updatedData);
		const chain = {};

		// refresh stack every time a new method is called on the chain.
		updatedData.stack = stripAbsolutePaths(stripSuitestCodeFromStack(Error().stack));

		Object.defineProperties(chain, mergeAll(composers.map(composer => composer(updatedData, chain, makeNewChain))));

		return chain;
	});

	return makeNewChain(data);
};

module.exports = makeChain;
