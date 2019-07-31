import * as suitest from '../../index';
const {nativeVideo} = suitest;

nativeVideo().timeout(10);
nativeVideo().abandon();
nativeVideo().then();
nativeVideo().timeout(10);
nativeVideo().toString();
nativeVideo().matches(suitest.PROP.ID).toString();

// getters
nativeVideo().it.should.with.times;
nativeVideo().should.it.with.times;
nativeVideo().with.should.it.times;
nativeVideo().times.should.with.it;

nativeVideo().isPaused();
nativeVideo().isStopped();
nativeVideo().isPlaying();
nativeVideo().isStopped().toAssert();
nativeVideo().toAssert().isStopped();
nativeVideo().isStopped().timeout(10);
nativeVideo().timeout(1).isStopped();

async function videoTest() {
    await nativeVideo().timeout(10);
    // Check if video's width and height match snapshot from video repo, top position as in repo +- 20px and custom background color
    const videoEl = suitest.video();

    await videoEl.matches(suitest.PROP.BG_COLOR, '#F00');

    await nativeVideo().matches(suitest.PROP.BG_COLOR, '#F00');

    await nativeVideo().matches({
        name: suitest.PROP.TOP,
        val: suitest.VALUE.REPO,
        type: suitest.COMP.APPROX,
        deviation: 20,
    });
    await nativeVideo().matches({
        name: suitest.PROP.BG_COLOR,
        val: '#F00',
    });
}
