import * as suitest from '../../index';

const {jsExpression} = suitest;

// should have all necessary modifiers
const baseLocation = jsExpression(() => '');
suitest.assert.jsExpression('');
suitest.assert.jsExpression(() => '');

baseLocation.not();
baseLocation.doesNot();
baseLocation.isNot();
baseLocation.timeout(10);
baseLocation.equal('');
baseLocation.equals('');
baseLocation.contain('');
baseLocation.contains('');
baseLocation.startWith('');
baseLocation.startsWith('');
baseLocation.endWith('');
baseLocation.endsWith('');
baseLocation.clone();
baseLocation.abandon();
baseLocation.toString();

// should have only allowed modifiers after condition started
const equalLoc = jsExpression(() => '').equal('');

equalLoc.not();
equalLoc.doesNot();
equalLoc.isNot();
equalLoc.timeout(10);
baseLocation.clone();
baseLocation.abandon();
equalLoc.toString();

// should have only allowed modifiers after timeout is set
const timeoutLoc = jsExpression(() => '').timeout(10);

timeoutLoc.not();
timeoutLoc.doesNot();
timeoutLoc.isNot();
timeoutLoc.equal('');
timeoutLoc.equals('');
timeoutLoc.contain('');
timeoutLoc.contains('');
timeoutLoc.startWith('');
timeoutLoc.startsWith('');
timeoutLoc.endWith('');
timeoutLoc.endsWith('');
baseLocation.clone();
baseLocation.abandon();
timeoutLoc.toString();

// should have only allowed modifiers after it is nagated
const notLoc = jsExpression(() => '').not();

notLoc.timeout(10);
notLoc.equal('');
notLoc.equals('');
notLoc.contain('');
notLoc.contains('');
notLoc.startWith('');
notLoc.startsWith('');
notLoc.endWith('');
notLoc.endsWith('');
baseLocation.clone();
baseLocation.abandon();
notLoc.toString();

// should have only toString method
const abandonedLoc = baseLocation.abandon();

abandonedLoc.toString();

// chaining examples
jsExpression(() => '').contain('').not().timeout(10);
jsExpression(() => '').contain('').timeout(10).not();
jsExpression(() => '').not().timeout(10).equal('');
jsExpression(() => '').timeout(10).not().endsWith('test');
jsExpression(() => '').timeout(10).endWith('test').not();
jsExpression(() => '').timeout(10).endWith('test').not().toAssert();

// getters
jsExpression(() => '').it.should.with.times;
jsExpression(() => '').should.it.with.times;
jsExpression(() => '').with.should.it.times;
jsExpression(() => '').times.should.with.it;
