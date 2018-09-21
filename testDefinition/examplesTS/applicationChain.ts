import * as suitest from '../../index';

const {application} = suitest;

// should have all necessary modifiers
const baseApp = application();

baseApp.toString();
baseApp.then();
baseApp.clone();
baseApp.abandon();
baseApp.hasExited();

// should have only toString method
const abandonedApp = application().abandon();

abandonedApp.toString();

// should have all methods except hasExited
const hasExitedApp = application().hasExited();

hasExitedApp.clone();
hasExitedApp.then();
hasExitedApp.abandon();
hasExitedApp.toString();
hasExitedApp.toAssert();

// getters
baseApp.it.should.with.times;
baseApp.should.it.with.times;
baseApp.with.should.it.times;
baseApp.times.should.with.it;
