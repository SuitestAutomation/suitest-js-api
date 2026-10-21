const assert = require('assert');
const {has} = require('ramda');

const {ELEMENT_PROP_TYPES} = require('../../lib/validation/elementPropTypes');
const {ELEMENT_PROP} = require('../../lib/constants/element');
const {PROP_COMPARATOR} = require('../../lib/constants/comparator');
const validationKeys = require('../../lib/constants/validationKeys');
const {validateJsonSchema} = require('../../lib/validation/validators');

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

	describe('Apple TV Ottium element properties', () => {
		const validateProps = props => validateJsonSchema(validationKeys.ELEMENT_PROPS, props);
		const prop = (name, val) => ({name, type: PROP_COMPARATOR.EQUAL, val});

		it('should accept a boolean isAccessible', () => {
			assert.doesNotThrow(() => validateProps([prop(ELEMENT_PROP.IS_ACCESSIBLE, true)]));
		});

		it('should accept a string label', () => {
			assert.doesNotThrow(() => validateProps([prop(ELEMENT_PROP.LABEL, 'Continue')]));
		});

		it('should reject isAccessible of a non boolean type', () => {
			assert.throws(
				() => validateProps([prop(ELEMENT_PROP.IS_ACCESSIBLE, 'true')]),
				/Element property 'isAccessible' should be of type boolean/,
			);
		});

		it('should reject label of a non string type', () => {
			assert.throws(
				() => validateProps([prop(ELEMENT_PROP.LABEL, 1)]),
				/Element property 'label' should be of type string/,
			);
		});
	});
});
