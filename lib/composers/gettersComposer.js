const composerTypes = require('../constants/composer');

const gettersComposer = (_, data, chain) => ['with', 'it', 'should', 'times'].reduce((acc, name) => ({
	...acc,
	[name]: {
		value: chain,
		configurable: false,
		writable: false,
		enumerable: true,
	},
}), {});

gettersComposer.composerType = composerTypes.GETTERS;

module.exports = gettersComposer;
