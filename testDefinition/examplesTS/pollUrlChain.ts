import * as suitest from '../../index';

const {pollUrl} = suitest;

// should have all necessary modifiers
const openUrlChain = pollUrl('some url', '');

openUrlChain.toString();
openUrlChain.then();
openUrlChain.abandon();
openUrlChain.clone();
openUrlChain.toAssert();

// should have only toString method
const abandonedOpenUrl = pollUrl('some url', '').abandon();

abandonedOpenUrl.toString();

// getters
openUrlChain.it.should.with.times;
openUrlChain.should.it.with.times;
openUrlChain.with.should.it.times;
openUrlChain.times.should.with.it;
