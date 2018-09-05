import { element, assert, PROP } from '../../index';

const el = element({
    css: '.my-element',
});
el.click();
el.exist();
el.moveTo();
el.sendText('');
el.timeout(1);
el.exists();
el.matches(PROP.IS_CHECKED, true);
el.then(e => e.backgroundColor);
el.then(e => e.text);
el.then(e => e.id);

// roku
el.matches([
	{
		name: PROP.FONT_NAME,
		val: 'string',
	},
	{
		name: PROP.FONT_SIZE,
		val: 1,
	},
	{
		name: PROP.ITEM_FOCUSED,
		val: 1,
	},
	{
		name: PROP.FONT_URI,
		val: 'string',
	},
]);
