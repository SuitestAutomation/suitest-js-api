import * as suitest from '../../index';

suitest.ocr([]);
suitest.ocr([]).timeout(1000);
suitest.ocr([]).timeout(1000).toAssert();
suitest.ocr([]).timeout(1000).toString();

suitest.ocr([
	{
		val: 'some-value'
	},
	{
		val: 'some-value',
		type: suitest.COMP.EQUAL,
	},
	{
		val: 'some-value',
		readAs: suitest.OCR_READ_AS.LINE,
	},
	{
		val: 'some-value',
		whitelist: 'allowed',
	},
	{
		val: 'some-value',
		blacklist: 'disallowed',
	},
	{
		val: 'some-value',
		region: [1, 1, 1, 1],
	},
	{
		val: 'some-value',
		align: true,
	},
	{
		val: 'some-value',
		color: suitest.OCR_COLOR.DARK,
	}
]);
