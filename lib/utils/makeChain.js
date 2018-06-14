const {mergeAll} = require('ramda');
const {wrap} = require('./sentry/Raven');

const makeChain = (getComposers, data) => {
	return wrap(makeNewChain)(data);

	function makeNewChain(updatedData) {
		const composers = getComposers(updatedData);
		const chain = {};

		Object.defineProperties(chain, mergeAll(composers.map(composer => composer(updatedData, chain, makeNewChain))));

		return chain;
	}
};

module.exports = makeChain;
