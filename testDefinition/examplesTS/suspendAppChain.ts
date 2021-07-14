import * as suitest from '../../index';

const {suspendApp} = suitest;

// should have all necessary modifiers
const suspendAppChain = suspendApp();

suspendAppChain.toString();
suspendAppChain.then();
suspendAppChain.abandon();
suspendAppChain.clone();
suspendAppChain.toAssert();

// should have only toString method
const abandonedSuspendApp = suspendApp().abandon();

abandonedSuspendApp.toString();

// getters
suspendAppChain.it.should.with.times;
suspendAppChain.should.it.with.times;
suspendAppChain.with.should.it.times;
suspendAppChain.times.should.with.it;
