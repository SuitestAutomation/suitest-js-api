const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

const attributesComposer = makeModifierComposer(
	composers.ATTRIBUTES,
	['getAttributes'],
	(_, meta, attributes) => ({
		...meta,
		attributes: attributes || [], // TODO - validation, should be Array<string>, optional
	}));

module.exports = attributesComposer;
