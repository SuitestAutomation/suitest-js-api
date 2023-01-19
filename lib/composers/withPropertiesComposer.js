const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const validation = require('../validation');
const {invalidInputMessage} = require('../texts');

const METHOD_NAME = 'withProperties';

const withPropertiesComposer = makeModifierComposer(
	composers.WITH_PROPERTIES,
	[METHOD_NAME],
	(_, meta, props) => {
		return {
			...meta,
			properties: validation.validate(
				validation.validators.COOKIE_PROPS,
				props,
				invalidInputMessage(METHOD_NAME),
			),
		};
	},
);

module.exports = withPropertiesComposer;
