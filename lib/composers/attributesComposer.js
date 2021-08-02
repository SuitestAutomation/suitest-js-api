const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

const attributesComposer = makeModifierComposer(
	composers.ATTRIBUTES,
	['getAttributes'],
	(_, meta, attributes = []) => ({
		...meta,
		attributes: validate(
			validators.ELEMENT_ATTRIBUTES,
			attributes,
			invalidInputMessage('getAttributes', 'Element attributes'),
		),
	}));

module.exports = attributesComposer;
