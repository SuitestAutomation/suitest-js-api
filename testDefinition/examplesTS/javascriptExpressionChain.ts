import * as suitest from '../../index';

const {jsExpression} = suitest;

// should have all necessary modifiers
const baseJSExpression = jsExpression(() => '');
suitest.assert.jsExpression('');
suitest.assert.jsExpression(() => '');

baseJSExpression.not();
baseJSExpression.doesNot();
baseJSExpression.isNot();
baseJSExpression.timeout(10);
baseJSExpression.timeout('<%variable%>');
baseJSExpression.equal('');
baseJSExpression.equals('');
baseJSExpression.contain('');
baseJSExpression.contains('');
baseJSExpression.startWith('');
baseJSExpression.startsWith('');
baseJSExpression.endWith('');
baseJSExpression.endsWith('');
baseJSExpression.clone();
baseJSExpression.abandon();
baseJSExpression.toString();

// should have only allowed modifiers after condition started
const equalJSExpression = jsExpression(() => '').equal('');

equalJSExpression.not();
equalJSExpression.doesNot();
equalJSExpression.isNot();
equalJSExpression.timeout(10);
equalJSExpression.clone();
equalJSExpression.abandon();
equalJSExpression.toString();

// should have only allowed modifiers after timeout is set
const timeoutJSExpression = jsExpression(() => '').timeout(10);

timeoutJSExpression.not();
timeoutJSExpression.doesNot();
timeoutJSExpression.isNot();
timeoutJSExpression.equal('');
timeoutJSExpression.equals('');
timeoutJSExpression.contain('');
timeoutJSExpression.contains('');
timeoutJSExpression.startWith('');
timeoutJSExpression.startsWith('');
timeoutJSExpression.endWith('');
timeoutJSExpression.endsWith('');
timeoutJSExpression.clone();
timeoutJSExpression.abandon();
timeoutJSExpression.toString();

// should have only allowed modifiers after it is nagated
const notJSExpression = jsExpression(() => '').not();

notJSExpression.timeout(10);
notJSExpression.equal('');
notJSExpression.equals('');
notJSExpression.contain('');
notJSExpression.contains('');
notJSExpression.startWith('');
notJSExpression.startsWith('');
notJSExpression.endWith('');
notJSExpression.endsWith('');
notJSExpression.clone();
notJSExpression.abandon();
notJSExpression.toString();

// should have only toString method
const abandonedJSExpression = baseJSExpression.abandon();

abandonedJSExpression.toString();

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
