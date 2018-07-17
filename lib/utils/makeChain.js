const {mergeAll} = require('ramda');
const {wrapThrow} = require('./sentry/Raven');

const makeChain = (getComposers, data) => {
	const makeNewChain = wrapThrow(updatedData => {
		const composers = getComposers(updatedData);
		const chain = {};

		Object.defineProperties(chain, mergeAll(composers.map(composer => composer(updatedData, chain, makeNewChain))));

		return chain;
	});

	return makeNewChain(data);
};

module.exports = makeChain;
