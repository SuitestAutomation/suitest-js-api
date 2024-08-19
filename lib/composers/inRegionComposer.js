const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

const inRegionComposer = makeModifierComposer(composers.IN_REGION, ['inRegion'], (_, meta, region) => {
	return {
		...meta,
		region: validate(
			validators.REGION,
			region,
			invalidInputMessage('region', 'Region'),
		),
	};
});

module.exports = inRegionComposer;
