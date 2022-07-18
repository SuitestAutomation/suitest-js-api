import * as suitest from '../../index';

const {openDeepLink} = suitest;

// should have all necessary modifiers
const openDeepLinkChain = openDeepLink('deep:link');

openDeepLinkChain.toString();
openDeepLinkChain.then();
openDeepLinkChain.abandon();
openDeepLinkChain.clone();
openDeepLinkChain.toAssert();

// should have only toString method
const abandonedOpenDeepLink = openDeepLink('deep:link').abandon();

abandonedOpenDeepLink.toString();

// getters
openDeepLinkChain.it.should.with.times;
openDeepLinkChain.should.it.with.times;
openDeepLinkChain.with.should.it.times;
openDeepLinkChain.times.should.with.it;
