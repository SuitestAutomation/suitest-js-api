const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

const cssPropsComposer = makeModifierComposer(
	composers.CSS_PROPS,
	['getCssProperties'],
	(_, meta, cssProps) => ({
		...meta,
		cssProps: cssProps || [], // TODO - validation, should be Array<string>, optional
		// TODO needs some performance testing and perhaps make a list of props mandatory
	}));

module.exports = cssPropsComposer;
