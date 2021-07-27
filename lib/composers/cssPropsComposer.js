const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {invalidInputMessage} = require('../texts');
const {validate, validators} = require('../validation');

const cssPropsComposer = makeModifierComposer(
	composers.CSS_PROPS,
	['getCssProperties'],
	(_, meta, cssProps) => ({
		...meta,
		cssProps: validate(
			validators.CSS_PROPS,
			cssProps,
			invalidInputMessage('getCssProperties', 'CSS properties'),
		),
	}));

module.exports = cssPropsComposer;
