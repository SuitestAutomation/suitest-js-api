import * as suitest from '../../index';

const {element, PROP, VALUE, COMP, VISIBILITY_STATE} = suitest;

const el = element({css: '.my-element'});
// const brsCodeExample = (
// `function test() as Boolean
//     return true
// end function`
// );

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
// el.matchesBrightScript('');
// el.matchBrightScript(brsCodeExample);
el.abandon();
el.matchesJS(() => true);
el.matchJS('() => true');
el.not();
el.isNot();
el.then();
el.toString();
el.matchesJS('').toString();
el.click().repeat(10).interval(2000).toString();
el.moveTo().toString();
el.sendText('text').toString();
el.sendText('text').repeat(10).interval(2000).toString();
el.sendText('text').repeat(10).interval(2000).toAssert();
el.timeout(10).not();

// Check if element's width and height match snapshot from element repo, top position as in repo +- 20px and custom background color
const elem = element('repo-id');

elem.matches(PROP.WIDTH);
elem.matches(PROP.HEIGHT);
elem.matches(PROP.TOP, VALUE.REPO, COMP.APPROX, 20);
elem.matches(PROP.BG_COLOR, '#F00');

// Same with object syntax
element('repo-id').matches({name: PROP.WIDTH});
element('repo-id').matches({name: PROP.HEIGHT});
element({css: '#repo-id'}).matches({
	name: PROP.TOP,
	val: VALUE.REPO,
	type: COMP.APPROX,
	deviation: 20,
});
element({css: '#repo-id'}).matches({
	name: PROP.BG_COLOR,
	val: '#F00',
});

// Same with array syntax
// User should be able mix'n'match this syntax options
element('repo-id').matches([
	PROP.WIDTH,
	PROP.HEIGHT,
	{
		name: PROP.TOP,
		val: VALUE.REPO, // could be omitted
		type: COMP.APPROX,
		deviation: 20,
	},
	{
		name: PROP.BG_COLOR,
		val: '#F00',
	},
]);

// Alias for repo-only elements - same syntax as matches, except "value" argument is always omitted
// It's here for better visibility of element repository features
element('repo-id').matchesRepo([
	{
		name: PROP.BG_COLOR,
		val: '#F00', // invalid, value is always taken from repo. Use matches for this
	},
	{
		name: PROP.LEFT,
		type: COMP.EQUAL,
	},
]);

// getters
el.it.should.with.times;
el.should.it.with.times;
el.with.should.it.times;
el.times.should.with.it;

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
