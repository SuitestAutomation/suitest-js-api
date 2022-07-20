const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

const METHOD_NAME = 'deepLink';

/**
 * Defines launchMode method
 */
const deepLinkComposer = makeModifierComposer(
	composers.DEEP_LINK,
	[METHOD_NAME],
	(_, meta, value) => {
		return {
			...meta,
			deepLink: validate(
				validators.NON_EMPTY_STRING,
				value,
				invalidInputMessage(METHOD_NAME, 'wrong argument'),
			),
		};
	},
);

module.exports = deepLinkComposer;
