import * as suitest from '../../index';

const {closeApp} = suitest;

// should have all necessary modifiers
const baseCloseApp = closeApp();

baseCloseApp.toString();
baseCloseApp.then();
baseCloseApp.abandon();
baseCloseApp.clone();
baseCloseApp.toAssert();

// should have only toString method
const abandonedCloseAppData = closeApp().abandon();

abandonedCloseAppData.toString();

// getters
baseCloseApp.it.should.with.times;
baseCloseApp.should.it.with.times;
baseCloseApp.with.should.it.times;
baseCloseApp.times.should.with.it;
