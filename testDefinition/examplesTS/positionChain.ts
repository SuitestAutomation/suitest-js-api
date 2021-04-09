import * as suitest from '../../index';

async function testPosition() {
	const {position} = suitest;

	const samplePos = position(100, 100);

	samplePos.abandon();
	samplePos.clone();
	samplePos.toString();
	samplePos.toAssert();
	samplePos.then();

	// click position
	const clickPos = position(1, 1,).click();

	await clickPos;
	await clickPos.repeat(1);
	await clickPos.repeat(5).interval(300);

	// tap position
	const tapPos = position(1, 1,).tap('single');
	position(1, 1,).tap('double');
	position(1, 1,).tap('long');
	position(1, 1).tap('long', 2);
	position(1, 1,).tap(suitest.TAP_TYPES.DOUBLE);
	position(1, 1,).tap(suitest.TAP_TYPES.LONG);
	position(1, 1,).tap(suitest.TAP_TYPES.LONG, 2);
	position(1, 1,).tap(suitest.TAP_TYPES.SINGLE);

	await tapPos;
	await tapPos.repeat(1);
	await tapPos.repeat(5).interval(300);

	// scroll position
	const scrollPos = position(1, 1,).scroll('up', 1);
	position(1, 1,).scroll('up', 1);
	position(1, 1,).scroll('up', 1);
	position(1, 1,).scroll(suitest.DIRECTIONS.DOWN, 1);
	position(1, 1,).scroll(suitest.DIRECTIONS.LEFT, 1);
	position(1, 1,).scroll(suitest.DIRECTIONS.RIGHT, 1);
	position(1, 1,).scroll(suitest.DIRECTIONS.UP, 1);

	await scrollPos;
	await scrollPos.repeat(1);
	await scrollPos.repeat(5).interval(300);

	// swipe position
	const swipePos = position(1, 1,).swipe('up', 1, 1);
	position(1, 1,).swipe('up', 1, 1);
	position(1, 1,).swipe('up', 1, 1);
	position(1, 1,).swipe(suitest.DIRECTIONS.DOWN, 1, 1);
	position(1, 1,).swipe(suitest.DIRECTIONS.LEFT, 1, 1);
	position(1, 1,).swipe(suitest.DIRECTIONS.RIGHT, 1, 1);
	position(1, 1,).swipe(suitest.DIRECTIONS.UP, 1, 1);

	await swipePos;
	await swipePos.repeat(1);
	await swipePos.repeat(5).interval(300);

	// flick position
	const flickPos = position(1, 1,).flick('up', 1, 1);
	position(1, 1,).flick('up', 1, 1);
	position(1, 1,).flick('up', 1, 1);
	position(1, 1,).flick(suitest.DIRECTIONS.DOWN, 1, 1);
	position(1, 1,).flick(suitest.DIRECTIONS.LEFT, 1, 1);
	position(1, 1,).flick(suitest.DIRECTIONS.RIGHT, 1, 1);
	position(1, 1,).flick(suitest.DIRECTIONS.UP, 1, 1);

	await flickPos;
	await flickPos.repeat(1);
	await flickPos.repeat(5).interval(300);

	// move to position
	await position(10, 10).moveTo();

	// getters
	samplePos.it.should.with.times;
	samplePos.should.it.with.times;
	samplePos.with.should.it.times;
	samplePos.times.should.with.it;
}
