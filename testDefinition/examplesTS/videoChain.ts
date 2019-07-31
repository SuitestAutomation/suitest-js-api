
// video should have the same return type as an element subject
import * as suitest from '../../index';
const {video} = suitest;

// const brsCodeExample = (
// `function test() as Boolean
//     return true
// end function`
// );

video().timeout(10);
video().abandon();
video().matchesJS(() => true);
video().matchJS('() => true');
video().not();
video().doesNot();
video().isNot();
video().exist();
video().exists();
video().visible();
video().then();
video().toString();
video().exists().toString();
video().matchesJS('').toString();
// video().matchesBrightScript(brsCodeExample).toString();
video().matches(suitest.PROP.VIDEO_STATE, suitest.VIDEO_STATE.PAUSED).toString();
video().click().toString();
video().click().repeat(10).interval(2000).toString();
video().moveTo().toString();

// getters
video().it.should.with.times;
video().should.it.with.times;
video().with.should.it.times;
video().times.should.with.it;

video().isPaused();
video().isStopped();
video().isPlaying();
video().isStopped().toAssert();
video().toAssert().isStopped();
video().isStopped().timeout(10);
video().timeout(1).isStopped();

async function videoTest() {
	await video().timeout(10).not();
	// Check if video's width and height match snapshot from video repo, top position as in repo +- 20px and custom background color
	const videoEl = suitest.video();

	await videoEl.matches(suitest.PROP.BG_COLOR, '#F00');

	await video().matches(suitest.PROP.BG_COLOR, '#F00');

	await video().matches({
		name: suitest.PROP.TOP,
		val: 400,
		type: suitest.COMP.APPROX,
		deviation: 20,
	});
	await video().matches({
		name: suitest.PROP.BG_COLOR,
		val: '#F00',
	});
}
