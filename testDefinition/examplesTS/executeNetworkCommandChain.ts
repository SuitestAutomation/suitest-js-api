import * as suitest from '../../index';

const {executeNetworkCommand} = suitest;

// should have all necessary modifiers
const executeNetworkCommandChain = executeNetworkCommand({downloadBytesPerSec: 50000, uploadBytesPerSec: 50000});

executeNetworkCommandChain.toString();
executeNetworkCommandChain.then();
executeNetworkCommandChain.abandon();
executeNetworkCommandChain.clone();
executeNetworkCommandChain.toAssert();

// null means no limit
executeNetworkCommand({downloadBytesPerSec: null, uploadBytesPerSec: null});

// should have only toString method
const abandonedExecuteNetworkCommand = executeNetworkCommand({downloadBytesPerSec: 0, uploadBytesPerSec: 0}).abandon();

abandonedExecuteNetworkCommand.toString();

// getters
executeNetworkCommandChain.it.should.with.times;
executeNetworkCommandChain.should.it.with.times;
executeNetworkCommandChain.with.should.it.times;
executeNetworkCommandChain.times.should.with.it;

// assert
suitest.assert.executeNetworkCommand({downloadBytesPerSec: 180000, uploadBytesPerSec: 84375});
