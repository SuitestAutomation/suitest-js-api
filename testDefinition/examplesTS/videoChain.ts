
// video should have the same return type as an element subject
import * as suitest from '../../index';
const {video} = suitest;

// const brsCodeExample = (
// `function test() as Boolean
//     return true
// end function`
// );

video().timeout(10).then(videoProps => {
	if (videoProps) {
		// check that ts allow access to video properties
		console.log(videoProps.videoLength, videoProps.isFocused);
	}
});
video().abandon();

// matchJS/matchesJS
// 1. Synchronous comparison
video().matchesJS(() => true);
video().matchJS('() => true');
video().matchJS((vid: any) => vid.videoLength > 0);

// 2. Callback function
video().matchJS((testSubject: any, callback: (error: Error | null, result: boolean) => void) => {
	callback(null, testSubject.videoLength > 0);
});

// 3. Promise-returning function
video().matchesJS((testSubject: any): Promise<boolean> => {
	return Promise.resolve(testSubject.videoLength > 0);
});

// 4. Async/await syntax
video().matchJS(async (testSubject: any): Promise<boolean> => {
	return testSubject.videoLength > 0;
});

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
