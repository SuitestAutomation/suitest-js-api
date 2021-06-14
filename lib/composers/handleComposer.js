const {makeModifierComposer} = require('../utils/makeComposer');
const composers = require('../constants/composer');

const handleComposer = makeModifierComposer(composers.GET_HANDLE, ['handle'], (_, meta, opts) => {
	const multiple = opts === true || (opts ? (typeof opts.multiple === 'boolean' ? opts.multiple : false) : false);

	return {
		...meta,
		handle: {multiple},
	};
});

module.exports = handleComposer;
