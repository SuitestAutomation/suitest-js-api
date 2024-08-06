const assert = require('assert');
const suitest = require('../../index');
const {
	ocr,
	ocrAssert,
	toJSON,
	getComposers,
} = require('../../lib/chains/ocrChain')(suitest);

const composers = require('../../lib/constants/composer');
const {getComposerTypes, bySymbol} = require('../../lib/utils/testHelpers');
const SuitestError = require('../../lib/utils/SuitestError');
const {PROP_COMPARATOR} = require('../../lib/constants/comparator');

const allOcrComposers = [
	composers.TO_STRING,
	composers.THEN,
	composers.ABANDON,
	composers.CLONE,
	composers.TIMEOUT,
	composers.TO_JSON,
	composers.ASSERT,
];

const excludeComposer = (composers, toExclude) => {
	return composers.filter((composer) => composer !== toExclude);
};

describe('OCR chain', () => {
	it('should have all necessary modifiers', () => {
		const composerTypes = getComposerTypes(getComposers({}));

		assert.deepStrictEqual(composerTypes, allOcrComposers.sort(bySymbol));

		assert.deepStrictEqual(
			getComposerTypes(getComposers({isAbandoned: true})),
			excludeComposer(allOcrComposers, composers.ABANDON),
		);

		assert.deepStrictEqual(
			getComposerTypes(getComposers({timeout: 1000})),
			excludeComposer(allOcrComposers, composers.TIMEOUT),
		);
	});

	it('should generate correct socket message based on internal data', () => {
		const querySocketMessage = {
			type: 'query',
			subject: {
				type: 'ocr',
			},
		};

		assert.deepStrictEqual(toJSON({}), querySocketMessage);
		assert.deepStrictEqual(ocr().toJSON(), querySocketMessage);

		// Should not apply timeout for "query"
		assert.deepStrictEqual(toJSON({timeout: 1000}), querySocketMessage);
		assert.deepStrictEqual(ocr().timeout(1000).toJSON(), querySocketMessage);

		// Should generate "query" message with defined comparators
		assert.deepStrictEqual(
			toJSON({
				ocrItems: [
					{val: 'some text'},
				],
			}),
			{
				type: 'query',
				subject: {
					type: 'ocr',
					options: [{val: 'some text'}],
				},
			},
		);
		assert.deepStrictEqual(
			ocr([{val: 'some text'}]).toJSON(),
			{
				type: 'query',
				subject: {
					type: 'ocr',
					options: [{val: 'some text', type: PROP_COMPARATOR.EQUAL}],
				},
			},
		);

		// Should generate "testLine" message with default timeout
		assert.deepStrictEqual(
			toJSON({isAssert: true, ocrItems: [{val: 'some-value'}]}),
			{
				type: 'testLine',
				request: {
					type: 'assert',
					condition: {
						type: 'ocrComparators',
						subject: {
							type: 'ocr',
						},
						comparators: [{val: 'some-value'}],
					},
					timeout: 2000,
				},
			},
		);
		assert.deepStrictEqual(
			ocrAssert([{val: 'some-value'}]).toJSON(),
			{
				type: 'testLine',
				request: {
					type: 'assert',
					condition: {
						type: 'ocrComparators',
						subject: {
							type: 'ocr',
						},
						comparators: [{val: 'some-value', type: PROP_COMPARATOR.EQUAL}],
					},
					timeout: 2000,
				},
			},
		);

		// should generate socket message with specified timeout
		assert.deepStrictEqual(
			toJSON({
				isAssert: true,
				timeout: 1000,
				ocrItems: [{val: 'some-value'}],
			}),
			{
				type: 'testLine',
				request: {
					type: 'assert',
					condition: {
						type: 'ocrComparators',
						subject: {
							type: 'ocr',
						},
						comparators: [{val: 'some-value'}],
					},
					timeout: 1000,
				},
			},
		);
		assert.deepStrictEqual(
			ocrAssert([{val: 'some-value'}]).timeout(1000).toJSON(),
			{
				type: 'testLine',
				request: {
					type: 'assert',
					condition: {
						type: 'ocrComparators',
						subject: {
							type: 'ocr',
						},
						comparators: [{val: 'some-value', type: PROP_COMPARATOR.EQUAL}],
					},
					timeout: 1000,
				},
			},
		);
	});

	it('should generate correct json when ocr called without arguments', () => {
		assert.deepStrictEqual(
			ocr().toJSON(),
			{
				type: 'query',
				subject: {
					type: 'ocr',
				},
			},
		);
	});

	it('should add default value for "type" property if "val" defined', () => {
		assert.deepStrictEqual(
			ocr([
				{
					region: [100, 100, 100, 100],
				},
				{
					val: 'some value',
				},
			]).toJSON(),
			{
				type: 'query',
				subject: {
					type: 'ocr',
					options: [
						{
							region: [100, 100, 100, 100],
						},
						{
							val: 'some value',
							type: PROP_COMPARATOR.EQUAL,
						},
					],
				},
			},
		);
		assert.deepStrictEqual(
			ocrAssert([
				{
					val: 'val1',
					type: PROP_COMPARATOR.CONTAIN,
				},
				{
					val: 'some value',
				},
			]).toJSON(),
			{
				type: 'testLine',
				request: {
					type: 'assert',
					condition: {
						type: 'ocrComparators',
						subject: {
							type: 'ocr',
						},
						comparators: [
							{
								val: 'val1',
								type: PROP_COMPARATOR.CONTAIN,
							},
							{
								val: 'some value',
								type: PROP_COMPARATOR.EQUAL,
							},
						],
					},
					timeout: 2000,
				},
			},
		);
	});

	it('float numbers should be allowed for "region" tuple', () => {
		assert.deepStrictEqual(
			ocr([{region: [1.0, 2.0, 3.0, 4.0]}]).toJSON(),
			{
				type: 'query',
				subject: {
					type: 'ocr',
					options: [
						{region: [1.0, 2.0, 3.0, 4.0]},
					],
				},
			},
		);
		assert.deepStrictEqual(
			ocrAssert([{val: 'text', region: [1.0, 2.0, 3.0, 4.0]}]).toJSON(),
			{
				type: 'testLine',
				request: {
					type: 'assert',
					condition: {
						type: 'ocrComparators',
						subject: {
							type: 'ocr',
						},
						comparators: [{val: 'text', type: PROP_COMPARATOR.EQUAL, region: [1.0, 2.0, 3.0, 4.0]}],
					},
					timeout: 2000,
				},
			},
		);
	});

	describe('throw error in case of invalid input', () => {
		const suitestInvalidInputError = (message) => {
			return new SuitestError(message, SuitestError.INVALID_INPUT);
		};

		it('comparators not an array error', () => {
			const shouldBeArrayError =
				suitestInvalidInputError('Invalid input provided for .ocr function. OCR data should be array');

			assert.throws(() => ocr(123), shouldBeArrayError);
			assert.throws(() => ocr(''), shouldBeArrayError);
			assert.throws(() => ocr(null), shouldBeArrayError);
			assert.throws(() => ocr(false), shouldBeArrayError);
			assert.throws(() => ocr({}), shouldBeArrayError);
		});

		it('ocr is malformed error', () => {
			// should throw error that assert ocr without comparators are malformed
			assert.throws(
				() => ocrAssert().toJSON(),
				suitestInvalidInputError('Assert ocr line is malformed - comparators are missing'),
			);
			assert.throws(
				() => ocrAssert([]).toJSON(),
				suitestInvalidInputError('Assert ocr line is malformed - comparators are missing'),
			);
		});

		it('"val" property should be required for assertions', () => {
			const valIsRequiredError = suitestInvalidInputError(
				'Invalid input provided for .ocr function. OCR data item at [0] index should have required property \'val\'',
			);

			assert.throws(() => ocrAssert([{}]), valIsRequiredError);
			assert.throws(() => ocr([{}]).toAssert().toJSON(), valIsRequiredError);
		});

		it('"val" should be specified if "type" is specified for "testLine" and "query"', () => {
			const valIsRequiredError = suitestInvalidInputError(
				'Invalid input provided for .ocr function. OCR data item at [0] index should have property val when property type is present',
			);

			assert.throws(() => ocr([{type: PROP_COMPARATOR.EQUAL}]), valIsRequiredError);
			assert.throws(() => ocrAssert([{type: PROP_COMPARATOR.EQUAL}]), valIsRequiredError);
		});

		it('"val" property are invalid', () => {
			// Should throw error that "val" is required
			assert.throws(
				() => ocr([{val: null}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].val index should be string',
				),
			);
			// Should throw error that "val" should be string
			assert.throws(
				() => ocr([{val: 0}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].val index should be string',
				),
			);
		});

		it('"type" property are invalid', () => {
			// Should throw error that "type" should be string comparator
			assert.throws(
				() => ocr([{val: 'some-val', type: 'unknown-type'}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].type index should be equal to one of the allowed values: "=", "!=", "~", "!~", "^", "!^", "$", "!$"',
				),
			);
		});

		it('"readAs" property are invalid', () => {
			// Should throw error that "readAs" should be "single-line", "single-word", "single-block"
			assert.throws(
				() => ocr([{val: 'some-val', readAs: 'unknown-read-mode'}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].readAs index should be equal to one of the allowed values: "single-line", "single-word", "single-block"',
				),
			);
		});

		it('"whitelist" property are invalid', () => {
			// Should throw error that "whitelist" should be a string
			assert.throws(
				() => ocr([{val: 'some-val', whitelist: null}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].whitelist index should be string',
				),
			);
		});

		it('"blacklist" property are invalid', () => {
			// Should throw error that "blacklist" should be a string
			assert.throws(
				() => ocr([{val: 'some-val', blacklist: null}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].blacklist index should be string',
				),
			);
		});

		it('"align" property are invalid', () => {
			assert.throws(
				() => ocr([{val: 'some-val', align: null}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].align index should be boolean',
				),
			);
		});

		it('"color" property are invalid', () => {
			assert.throws(
				() => ocr([{val: 'some-val', color: 'some-color'}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].color index should be equal to one of the allowed values: "dark", "light"',
				),
			);
		});

		it('"region" property are invalid', () => {
			assert.throws(
				() => ocr([{val: 'some-val', region: null}]),
				suitestInvalidInputError('Invalid input provided for .ocr function. OCR data item at [0].region index should be array'),
			);
			assert.throws(
				() => ocr([{val: 'some-val', region: [-1, 0, 0, 0]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[0] index should be >= 0',
				),
			);
			assert.throws(
				() => ocr([{val: 'some-val', region: [1]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region index should NOT have fewer than 4 items',
				),
			);
			assert.throws(
				() => ocr([{val: 'some-val', region: [-1, 0, 1, 1]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[0] index should be >= 0',
				),
			);
			assert.throws(
				() => ocr([{val: 'some-val', region: [0, -1, 1, 1]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[1] index should be >= 0',
				),
			);
			assert.throws(
				() => ocr([{val: 'some-val', region: [0, 0, 0, 1]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[2] index should be > 0',
				),
			);
			assert.throws(
				() => ocr([{val: 'some-val', region: [0, 0, 1, 0]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[3] index should be > 0',
				),
			);
			assert.throws(
				() => ocr([{val: 'some-val', region: [0, 0, 0, 0, 'additional-item']}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region index should NOT have more than 4 items',
				),
			);
		});

		it('"region" items should not be greater than 100', () => {
			assert.throws(
				() => ocr([{val: 'some-val', region: [101, 101, 101, 101]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[0] index should be <= 100',
				),
			);
			assert.throws(
				() => ocrAssert([{val: 'some-val', region: [101, 101, 101, 101]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[0] index should be <= 100',
				),
			);
			assert.throws(
				() => ocr([{val: 'some-val', region: [100, 101, 101, 101]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[1] index should be <= 100',
				),
			);
			assert.throws(
				() => ocrAssert([{val: 'some-val', region: [100, 101, 101, 101]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[1] index should be <= 100',
				),
			);
			assert.throws(
				() => ocr([{val: 'some-val', region: [100, 100, 101, 101]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[2] index should be <= 100',
				),
			);
			assert.throws(
				() => ocrAssert([{val: 'some-val', region: [100, 100, 101, 101]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[2] index should be <= 100',
				),
			);
			assert.throws(
				() => ocr([{val: 'some-val', region: [100, 100, 100, 101]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[3] index should be <= 100',
				),
			);
			assert.throws(
				() => ocrAssert([{val: 'some-val', region: [100, 100, 100, 101]}]),
				suitestInvalidInputError(
					'Invalid input provided for .ocr function. OCR data item at [0].region[3] index should be <= 100',
				),
			);
		});
	});
});
