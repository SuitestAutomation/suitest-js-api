import * as suitest from '../../index';
const {nativeVideo} = suitest;

nativeVideo().timeout(10);
nativeVideo().abandon();
nativeVideo().then();
nativeVideo().toString();
nativeVideo().matches(suitest.PROP.VIDEO_STATE, suitest.VIDEO_STATE.PAUSED).toString();

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
    const videoEl = suitest.nativeVideo();

    await videoEl.matches(suitest.PROP.VIDEO_LENGTH, 300);

    await nativeVideo().matches(suitest.PROP.VIDEO_LENGTH, 300);

    await nativeVideo().matches({
        name: suitest.PROP.VIDEO_POSITION,
        val: 60,
        type: suitest.COMP.APPROX,
        deviation: 20,
    });
    await nativeVideo().matches({
        name: suitest.PROP.VIDEO_URL,
        val: 'video/url',
    });
}
