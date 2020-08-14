const assert = require('assert');
const {has} = require('ramda');

const {ELEMENT_PROP_TYPES} = require('../../lib/validation/elementPropTypes');
const {ELEMENT_PROP} = require('../../lib/constants/element');

describe('Testing elementPropTypes.', () => {
	it('ELEMENT_PROP_TYPES should contain types for all ELEMENT_PROPS', () => {
		const propsWithoutTypes = Object
			.entries(ELEMENT_PROP)
			.reduce((missedTypes, [key, val]) => {
				if (!has(val, ELEMENT_PROP_TYPES)) {
					missedTypes[key] = val;
				}

				return missedTypes;
			}, {});

		assert.deepStrictEqual(propsWithoutTypes, {}, 'Typing missed.');
	});
});
