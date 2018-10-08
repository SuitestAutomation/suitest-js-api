import * as suitest from '../../index';

const {openUrl} = suitest;

// should have all necessary modifiers
const openUrlChain = openUrl('some url');

openUrlChain.toString();
openUrlChain.then();
openUrlChain.abandon();
openUrlChain.clone();
openUrlChain.toAssert();

// should have only toString method
const abandonedOpenUrl = openUrl('some url').abandon();

abandonedOpenUrl.toString();

// getters
openUrlChain.it.should.with.times;
openUrlChain.should.it.with.times;
openUrlChain.with.should.it.times;
openUrlChain.times.should.with.it;
