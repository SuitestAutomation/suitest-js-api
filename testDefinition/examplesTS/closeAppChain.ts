import * as suitest from '../../index';

const {closeApp} = suitest;

// should have all necessary modifiers
const closeAppChain = closeApp();

closeAppChain.toString();
closeAppChain.then();
closeAppChain.abandon();
closeAppChain.clone();
closeAppChain.toAssert();

// should have only toString method
const abandonedCloseApp = closeApp().abandon();

abandonedCloseApp.toString();

// getters
closeAppChain.it.should.with.times;
closeAppChain.should.it.with.times;
closeAppChain.with.should.it.times;
closeAppChain.times.should.with.it;
