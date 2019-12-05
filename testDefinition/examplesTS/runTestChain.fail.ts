import * as suitest from '../../index';

suitest.runTest('testId');
suitest.assert.runTest();
suitest.assert.runTest(1);
suitest.assert.runTest('testId').delay(1);
