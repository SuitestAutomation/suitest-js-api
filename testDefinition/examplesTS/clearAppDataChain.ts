import * as suitest from '../../index';

const {clearAppData} = suitest;

// should have all necessary modifiers
const baseClearAppData = clearAppData();

baseClearAppData.toString();
baseClearAppData.then();
baseClearAppData.abandon();
baseClearAppData.clone();
baseClearAppData.toAssert();

// should have only toString method
const abandonedClearAppData = clearAppData().abandon();

abandonedClearAppData.toString();

// getters
baseClearAppData.it.should.with.times;
baseClearAppData.should.it.with.times;
baseClearAppData.with.should.it.times;
baseClearAppData.times.should.with.it;
