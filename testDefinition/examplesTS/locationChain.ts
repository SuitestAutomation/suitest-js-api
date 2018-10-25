import * as suitest from '../../index';

const {location} = suitest;

// should have all necessary modifiers
const baseLocation = location();

const jsFunc = () => true;
const jsFuncStr = '() => true';

baseLocation.not();
baseLocation.doesNot();
baseLocation.isNot();
baseLocation.timeout(10);
baseLocation.equal('');
baseLocation.equals('');
baseLocation.contain('');
baseLocation.contains('');
baseLocation.matchJS(jsFunc);
baseLocation.matchesJS(jsFuncStr);
baseLocation.startWith('');
baseLocation.startsWith('');
baseLocation.endWith('');
baseLocation.endsWith('');
baseLocation.clone();
baseLocation.abandon();
baseLocation.toString();

// should have only allowed modifiers after condition started
const equalLoc = location().equal('');

equalLoc.not();
equalLoc.doesNot();
equalLoc.isNot();
equalLoc.timeout(10);
baseLocation.clone();
baseLocation.abandon();
equalLoc.toString();

// should have only allowed modifiers after timeout is set
const timeoutLoc = location().timeout(10);

timeoutLoc.not();
timeoutLoc.doesNot();
timeoutLoc.isNot();
timeoutLoc.equal('');
timeoutLoc.equals('');
timeoutLoc.contain('');
timeoutLoc.contains('');
timeoutLoc.matchJS(jsFunc);
timeoutLoc.matchesJS(jsFuncStr);
timeoutLoc.startWith('');
timeoutLoc.startsWith('');
timeoutLoc.endWith('');
timeoutLoc.endsWith('');
baseLocation.clone();
baseLocation.abandon();
timeoutLoc.toString();

// should have only allowed modifiers after it is nagated
const notLoc = location().not();

notLoc.timeout(10);
notLoc.equal('');
notLoc.equals('');
notLoc.contain('');
notLoc.contains('');
notLoc.matchJS(jsFunc);
notLoc.matchesJS(jsFuncStr);
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
location().contain('').not().timeout(10);
location().contain('').timeout(10).not();
location().not().matchJS(jsFunc).timeout(10);
location().not().timeout(10).equal('');
location().timeout(10).not().endsWith('test');
location().timeout(10).endWith('test').not();
location().timeout(10).endWith('test').not().toAssert();

// getters
location().it.should.with.times;
location().should.it.with.times;
location().with.should.it.times;
location().times.should.with.it;
