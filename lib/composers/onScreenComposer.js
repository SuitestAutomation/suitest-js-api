const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

const onScreenComposer = makeModifierComposer(composers.ON_SCREEN, ['onScreen'], (_, meta) => {
	const newMetaData = {...meta};

	if ('region' in newMetaData) {
		delete newMetaData.region;
	}

	return newMetaData;
});

module.exports = onScreenComposer;
