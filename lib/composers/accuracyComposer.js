const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

const accuracyComposer = makeModifierComposer(composers.ACCURACY, ['accuracy'], (_, meta, accuracy) => {
	return {
		...meta,
		accuracy: validate(
			validators.ACCURACY,
			accuracy,
			invalidInputMessage('accuracy', 'Accuracy'),
		),
	};
});

const getAccuracy = (meta) => {
	return meta.accuracy;
};

module.exports = {
	accuracyComposer,
	getAccuracy,
};
