import * as suitest from '../../index';

const bsCodeExample = (
`function test() as Boolean
    return true
end function`
);

const {brightScriptExpression} = suitest;

// should have all necessary modifiers
const baseBSExpression = brightScriptExpression(bsCodeExample);
suitest.assert.brightScriptExpression('');
suitest.assert.brightScriptExpression(bsCodeExample);

baseBSExpression.not();
baseBSExpression.doesNot();
baseBSExpression.isNot();
baseBSExpression.timeout(10);
baseBSExpression.equal('');
baseBSExpression.equals('');
baseBSExpression.contain('');
baseBSExpression.contains('');
baseBSExpression.startWith('');
baseBSExpression.startsWith('');
baseBSExpression.endWith('');
baseBSExpression.endsWith('');
baseBSExpression.clone();
baseBSExpression.abandon();
baseBSExpression.toString();

// should have only allowed modifiers after condition started
const equalBSExpression = brightScriptExpression(bsCodeExample).equal('');

equalBSExpression.not();
equalBSExpression.doesNot();
equalBSExpression.isNot();
equalBSExpression.timeout(10);
equalBSExpression.clone();
equalBSExpression.abandon();
equalBSExpression.toString();

// should have only allowed modifiers after timeout is set
const timeoutBSExpression = brightScriptExpression(bsCodeExample).timeout(10);

timeoutBSExpression.not();
timeoutBSExpression.doesNot();
timeoutBSExpression.isNot();
timeoutBSExpression.equal('');
timeoutBSExpression.equals('');
timeoutBSExpression.contain('');
timeoutBSExpression.contains('');
timeoutBSExpression.startWith('');
timeoutBSExpression.startsWith('');
timeoutBSExpression.endWith('');
timeoutBSExpression.endsWith('');
timeoutBSExpression.clone();
timeoutBSExpression.abandon();
timeoutBSExpression.toString();

// should have only allowed modifiers after it is nagated
const notBSExpression = brightScriptExpression(bsCodeExample).not();

notBSExpression.timeout(10);
notBSExpression.equal('');
notBSExpression.equals('');
notBSExpression.contain('');
notBSExpression.contains('');
notBSExpression.startWith('');
notBSExpression.startsWith('');
notBSExpression.endWith('');
notBSExpression.endsWith('');
notBSExpression.clone();
notBSExpression.abandon();
notBSExpression.toString();

// should have only toString method
const abandonedBSExpression = baseBSExpression.abandon();

abandonedBSExpression.toString();

// chaining examples
brightScriptExpression(bsCodeExample).contain('').not().timeout(10);
brightScriptExpression(bsCodeExample).contain('').timeout(10).not();
brightScriptExpression(bsCodeExample).not().timeout(10).equal('');
brightScriptExpression(bsCodeExample).timeout(10).not().endsWith('test');
brightScriptExpression(bsCodeExample).timeout(10).endWith('test').not();
brightScriptExpression(bsCodeExample).timeout(10).endWith('test').not().toAssert();

// gettersbsCodeExample
brightScriptExpression(bsCodeExample).it.should.with.times;
brightScriptExpression(bsCodeExample).should.it.with.times;
brightScriptExpression(bsCodeExample).with.should.it.times;
brightScriptExpression(bsCodeExample).times.should.with.it;
