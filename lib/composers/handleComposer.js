const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');
const {validate, validators} = require('../validation');
const {invalidInputMessage} = require('../texts');

const handleComposer = makeModifierComposer(
	composers.GET_HANDLE,
	['handle'],
	(_, meta, opts = false) => {
		validate(
			validators.ELEMENT_HANDLE,
			opts,
			invalidInputMessage('handle'),
		);
		const multiple = opts === true || (opts ? (typeof opts.multiple === 'boolean' ? opts.multiple : false) : false);

		return {
			...meta,
			handle: {multiple},
		};
	});

module.exports = handleComposer;
