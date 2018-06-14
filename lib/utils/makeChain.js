const {mergeAll} = require('ramda');
const {captureException} = require('./sentry/Raven');

const makeChain = (getComposers, data) => {
	return makeNewChain(data);

	function makeNewChain(updatedData) {
		let chain;

		try {
			const composers = getComposers(updatedData);

			chain = {};

			Object.defineProperties(
				chain,
				mergeAll(composers.map(composer => composer(updatedData, chain, makeNewChain)))
			);
		} catch (e) {
			captureException(e);
			throw e;
		}

		return chain;
	}
};

module.exports = makeChain;
