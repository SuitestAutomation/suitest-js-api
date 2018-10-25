import * as suitest from '../../index';

const brsCodeExample = (
`function test() as Boolean
    return true
end function`
);

const {brightScriptExpression} = suitest;

// should have all necessary modifiers
const baseBRSExpression = brightScriptExpression(brsCodeExample);
suitest.assert.brightScriptExpression('');
suitest.assert.brightScriptExpression(brsCodeExample);

baseBRSExpression.not();
baseBRSExpression.doesNot();
baseBRSExpression.isNot();
baseBRSExpression.timeout(10);
baseBRSExpression.equal('');
baseBRSExpression.equals('');
baseBRSExpression.contain('');
baseBRSExpression.contains('');
baseBRSExpression.startWith('');
baseBRSExpression.startsWith('');
baseBRSExpression.endWith('');
baseBRSExpression.endsWith('');
baseBRSExpression.clone();
baseBRSExpression.abandon();
baseBRSExpression.toString();

// should have only allowed modifiers after condition started
const equalBRSExpression = brightScriptExpression(brsCodeExample).equal('');

equalBRSExpression.not();
equalBRSExpression.doesNot();
equalBRSExpression.isNot();
equalBRSExpression.timeout(10);
equalBRSExpression.clone();
equalBRSExpression.abandon();
equalBRSExpression.toString();

// should have only allowed modifiers after timeout is set
const timeoutBRSExpression = brightScriptExpression(brsCodeExample).timeout(10);

timeoutBRSExpression.not();
timeoutBRSExpression.doesNot();
timeoutBRSExpression.isNot();
timeoutBRSExpression.equal('');
timeoutBRSExpression.equals('');
timeoutBRSExpression.contain('');
timeoutBRSExpression.contains('');
timeoutBRSExpression.startWith('');
timeoutBRSExpression.startsWith('');
timeoutBRSExpression.endWith('');
timeoutBRSExpression.endsWith('');
timeoutBRSExpression.clone();
timeoutBRSExpression.abandon();
timeoutBRSExpression.toString();

// should have only allowed modifiers after it is nagated
const notBRSExpression = brightScriptExpression(brsCodeExample).not();

notBRSExpression.timeout(10);
notBRSExpression.equal('');
notBRSExpression.equals('');
notBRSExpression.contain('');
notBRSExpression.contains('');
notBRSExpression.startWith('');
notBRSExpression.startsWith('');
notBRSExpression.endWith('');
notBRSExpression.endsWith('');
notBRSExpression.clone();
notBRSExpression.abandon();
notBRSExpression.toString();

// should have only toString method
const abandonedBRSExpression = baseBRSExpression.abandon();

abandonedBRSExpression.toString();

// chaining examples
brightScriptExpression(brsCodeExample).contain('').not().timeout(10);
brightScriptExpression(brsCodeExample).contain('').timeout(10).not();
brightScriptExpression(brsCodeExample).not().timeout(10).equal('');
brightScriptExpression(brsCodeExample).timeout(10).not().endsWith('test');
brightScriptExpression(brsCodeExample).timeout(10).endWith('test').not();
brightScriptExpression(brsCodeExample).timeout(10).endWith('test').not().toAssert();

// gettersbsCodeExample
brightScriptExpression(brsCodeExample).it.should.with.times;
brightScriptExpression(brsCodeExample).should.it.with.times;
brightScriptExpression(brsCodeExample).with.should.it.times;
brightScriptExpression(brsCodeExample).times.should.with.it;
