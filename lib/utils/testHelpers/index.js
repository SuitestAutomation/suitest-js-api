/* istanbul ignore file */

const bySymbol = (a, b) => a.toString() > b.toString() ? 1 : -1;
const getComposerTypes = comps => comps.map(c => c.composerType).sort(bySymbol);

module.exports = {
	bySymbol,
	getComposerTypes,
};
