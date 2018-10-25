import * as suitest from '../../index';

const {cookie} = suitest;

// should have all necessary modifiers
const baseCookie = cookie('cookieName');

const jsFunc = () => true;
const jsFuncStr = '() => true';

baseCookie.not();
baseCookie.doesNot();
baseCookie.isNot();
baseCookie.exist();
baseCookie.exists();
baseCookie.matchJS(jsFunc);
baseCookie.matchesJS(jsFuncStr);
baseCookie.equal('');
baseCookie.equals('');
baseCookie.contain('');
baseCookie.contains('');
baseCookie.startWith('');
baseCookie.startsWith('');
baseCookie.endWith('');
baseCookie.endsWith('');
baseCookie.timeout(10);
baseCookie.clone();
baseCookie.abandon();
baseCookie.toString();

// should have only allowed modifiers after condition started
const evalCookie = cookie('cookieName').equal('test');

evalCookie.not();
evalCookie.doesNot();
evalCookie.isNot();
evalCookie.timeout(10);
evalCookie.clone();
evalCookie.abandon();
evalCookie.toString();

// should have only allowed modifiers after timeout is set
const timeoutCookie = cookie('cookieName').timeout(10);

timeoutCookie.not();
timeoutCookie.doesNot();
timeoutCookie.isNot();
timeoutCookie.exist();
timeoutCookie.exists();
timeoutCookie.matchJS(jsFunc);
timeoutCookie.matchesJS(jsFuncStr);
timeoutCookie.equal('');
timeoutCookie.equals('');
timeoutCookie.contain('');
timeoutCookie.contains('');
timeoutCookie.startWith('');
timeoutCookie.startsWith('');
timeoutCookie.endWith('');
timeoutCookie.endsWith('');
timeoutCookie.clone();
timeoutCookie.abandon();
timeoutCookie.toString();

// should have only allowed modifiers after it is nagated
const notCookie = cookie('cookieName').not();

notCookie.timeout(10);
notCookie.equal('');
notCookie.equals('');
notCookie.contain('');
notCookie.contains('');
notCookie.matchJS(jsFunc);
notCookie.matchesJS(jsFuncStr);
notCookie.startWith('');
notCookie.startsWith('');
notCookie.endWith('');
notCookie.endsWith('');
notCookie.exist();
notCookie.exists();
notCookie.clone();
notCookie.abandon();
notCookie.toString();

// should have only toString method
const abandonedCookie = baseCookie.abandon();

abandonedCookie.toString();

// chaining exapmples
cookie('cookieName').contain('').not().timeout(10);
cookie('cookieName').exist().timeout(10).not();
cookie('cookieName').not().matchJS(jsFunc).timeout(10);
cookie('cookieName').not().timeout(10).equal('');
cookie('cookieName').timeout(10).not().endsWith('test');
cookie('cookieName').timeout(10).endWith('test').not();
cookie('cookieName').timeout(10).endWith('test').not().toAssert();

// getters
cookie('cookieName').it.should.with.times;
cookie('cookieName').should.it.with.times;
cookie('cookieName').with.should.it.times;
cookie('cookieName').times.should.with.it;
