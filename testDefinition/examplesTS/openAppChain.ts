import * as suitest from '../../index';

const {openApp} = suitest;

// should have all necessary modifiers
const openAppChain = openApp('some url');

openAppChain.toString();
openAppChain.then();
openAppChain.abandon();
openAppChain.clone();
openAppChain.toAssert();

// should have only toString method
const abandonedOpenApp = openApp().abandon();

abandonedOpenApp.toString();

// getters
openAppChain.it.should.with.times;
openAppChain.should.it.with.times;
openAppChain.with.should.it.times;
openAppChain.times.should.with.it;
