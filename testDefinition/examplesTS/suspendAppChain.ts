import * as suitest from '../../index';

const {suspendApp} = suitest;

// should have all necessary modifiers
const baseSuspendApp = suspendApp();

baseSuspendApp.toString();
baseSuspendApp.then();
baseSuspendApp.abandon();
baseSuspendApp.clone();
baseSuspendApp.toAssert();

// should have only toString method
const abandonedSuspendAppData = suspendApp().abandon();

abandonedSuspendAppData.toString();

// getters
baseSuspendApp.it.should.with.times;
baseSuspendApp.should.it.with.times;
baseSuspendApp.with.should.it.times;
baseSuspendApp.times.should.with.it;
