import * as suitest from '../../index';
const {psVideo} = suitest;

psVideo().timeout(10);
psVideo().abandon();
psVideo().then();
psVideo().toString();
psVideo().matches(suitest.PROP.VIDEO_STATE, suitest.VIDEO_STATE.PAUSED).toString();

// getters
psVideo().it.should.with.times;
psVideo().should.it.with.times;
psVideo().with.should.it.times;
psVideo().times.should.with.it;

psVideo().isPaused();
psVideo().isStopped();
psVideo().isPlaying();
psVideo().isStopped().toAssert();
psVideo().toAssert().isStopped();
psVideo().isStopped().timeout(10);
psVideo().timeout(1).isStopped();

async function videoTest() {
    await psVideo().timeout(10);
    const videoEl = suitest.psVideo();

    await videoEl.matches(suitest.PROP.VIDEO_LENGTH, 300);

    await psVideo().matches(suitest.PROP.VIDEO_LENGTH, 300);

    await psVideo().matches({
        name: suitest.PROP.VIDEO_POSITION,
        val: 60,
        type: suitest.COMP.APPROX,
        deviation: 20,
    });
    await psVideo().matches({
        name: suitest.PROP.VIDEO_URL,
        val: 'video/url',
    });
}
