import { element, assert, PROP, VISIBILITY_STATE } from '../../index';

let el = element({
    css: '.my-element',
});

// element can accept strings
el = element('.my-element');

el.click();
el.exist();
el.moveTo();
el.sendText('');
el.timeout(1);
el.exists();
el.matches(PROP.IS_CHECKED, true);
el.then(e => e && e.backgroundColor);
el.then(e => e && e.text);
el.then(e => e && e.id);
el.doesNot().exist();
el.timeout(1).doesNot().exist();
el.doesNot().exist().timeout(1);
el.matchesJS('');

// roku
el.matches([
	{
		name: PROP.FONT_NAME,
		val: 'string',
	},
	{
		name: PROP.VISIBILITY,
		val: VISIBILITY_STATE.VISIBLE,
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
