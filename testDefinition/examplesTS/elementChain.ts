import * as suitest from '../../index';

const {element, PROP, VALUE, COMP, VISIBILITY_STATE, VIDEO_STATE} = suitest;

const el = element({css: '.my-element'});
// const brsCodeExample = (
// `function test() as Boolean
//     return true
// end function`
// );

el.click();
el.exist();
el.visible();
el.moveTo();
el.sendText('');
el.setText('');
el.timeout(1).then(props => {
	if (props) {
		// check that ts allow access to video properties
		console.log(props.width, props.automationName, props.text);
	}
});
el.exists();
el.matches(PROP.IS_CHECKED, true);
el.matches(PROP.VIDEO_STATE, VIDEO_STATE.UNDEFINED);
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
el.setText('text').toString();
el.sendText('text').repeat(10).interval(2000).toString();
el.sendText('text').repeat('<%variable%>').interval('<%variable%>').toAssert();
el.setText('text').toString();
el.setText('text').toAssert();
el.timeout(10).not();
el.isPlaying();
el.isPaused();
el.isStopped();

// Check if element's width and height match snapshot from element repo, top position as in repo +- 20px and custom background color
const elem = element('repo-id');

elem.matches(PROP.WIDTH);
elem.matches(PROP.HEIGHT);
elem.matches(PROP.TOP, VALUE.REPO, COMP.APPROX, 20);
elem.matches(PROP.TOP, VALUE.REPO, COMP.APPROX, '<%variable%>');
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
element({css: '#repo-id'}).matches({
	[PROP.BG_COLOR]: 'red',
	[PROP.HREF]: 'http://somelingk',
	borderWidth: 233,
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
	{
		[PROP.CLASS]: 'friendlyClass',
		[PROP.TEXT_CONTENT]: 'Lorem ipsum',
	}
]);

// Alias for repo-only elements - same syntax as matches, except "value" argument is always omitted
// It's here for better visibility of element repository features
element('repo-id').matchesRepo([
	{
		name: PROP.BG_COLOR,
	},
	{
		name: PROP.LEFT,
		type: COMP.EQUAL,
	},
	{
		name: PROP.VISIBILITY,
		type: COMP.EQUAL,
	}
]);

el.matchesRepo({
	name: PROP.VISIBILITY,
	type: COMP.EQUAL,
});

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
	{
		name: PROP.URL,
		type: COMP.END,
		val: 'string',
	},
]);

// With assert
suitest.assert.element('api-id');

async () => {
	// tap element
	const tapElement = element('a').tap('single');
	element('a').tap('double');
	element('a').tap('long');
	element('a').tap('long', 2000);
	element('a').tap(suitest.TAP_TYPES.DOUBLE);
	element('a').tap(suitest.TAP_TYPES.LONG);
	element('a').tap(suitest.TAP_TYPES.LONG, 2000);
	element('a').tap(suitest.TAP_TYPES.SINGLE);

	await tapElement;
	await tapElement.repeat(1);
	await tapElement.repeat(5).interval(300);


	// scroll from element
	const scrollElement = element('b').scroll('up', 1);
	element('b').scroll('up', 1);
	element('b').scroll('up', 1);
	element('b').scroll(suitest.DIRECTIONS.DOWN, 1);
	element('b').scroll(suitest.DIRECTIONS.LEFT, 1);
	element('b').scroll(suitest.DIRECTIONS.RIGHT, 1);
	element('b').scroll(suitest.DIRECTIONS.UP, 1);

	await scrollElement;
	await scrollElement.repeat(1);
	await scrollElement.repeat(5).interval(300);

// swipe position
	const swipePos = element('a').swipe('up', 1, 1);
	element('b').swipe('up', 1, 1);
	element('b').swipe('up', 1, 1);
	element('b').swipe(suitest.DIRECTIONS.DOWN, 1, 1);
	element('b').swipe(suitest.DIRECTIONS.LEFT, 1, 1);
	element('b').swipe(suitest.DIRECTIONS.RIGHT, 1, 1);
	element('b').swipe(suitest.DIRECTIONS.UP, 1, 1);

	await swipePos;
	await swipePos.repeat(1);
	await swipePos.repeat(5).interval(300);

	// flick position
	const flickPos = element('a').flick('up', 1, 1);
	element('b').flick('up', 1, 1);
	element('b').flick('up', 1, 1);
	element('b').flick(suitest.DIRECTIONS.DOWN, 1, 1);
	element('b').flick(suitest.DIRECTIONS.LEFT, 1, 1);
	element('b').flick(suitest.DIRECTIONS.RIGHT, 1, 1);
	element('b').flick(suitest.DIRECTIONS.UP, 1, 1);

	await flickPos;
	await flickPos.repeat(1);
	await flickPos.repeat(5).interval(300);

}
