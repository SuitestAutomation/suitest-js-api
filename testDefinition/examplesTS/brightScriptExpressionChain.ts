import * as suitest from '../../index';

const bsCodeExample = (
`function test() as Boolean
    return true
end function`
);

const {brightScriptExpression} = suitest;

// should have all necessary modifiers
const baseChain = brightScriptExpression(bsCodeExample);
suitest.assert.brightScriptExpression('');
suitest.assert.brightScriptExpression(bsCodeExample);

baseChain.not();
baseChain.doesNot();
baseChain.isNot();
baseChain.timeout(10);
baseChain.equal('');
baseChain.equals('');
baseChain.contain('');
baseChain.contains('');
baseChain.startWith('');
baseChain.startsWith('');
baseChain.endWith('');
baseChain.endsWith('');
baseChain.clone();
baseChain.abandon();
baseChain.toString();

// should have only allowed modifiers after condition started
const equalLoc = brightScriptExpression(bsCodeExample).equal('');

equalLoc.not();
equalLoc.doesNot();
equalLoc.isNot();
equalLoc.timeout(10);
baseChain.clone();
baseChain.abandon();
equalLoc.toString();

// should have only allowed modifiers after timeout is set
const timeoutLoc = brightScriptExpression(bsCodeExample).timeout(10);

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
baseChain.clone();
baseChain.abandon();
timeoutLoc.toString();

// should have only allowed modifiers after it is nagated
const notLoc = brightScriptExpression(bsCodeExample).not();

notLoc.timeout(10);
notLoc.equal('');
notLoc.equals('');
notLoc.contain('');
notLoc.contains('');
notLoc.startWith('');
notLoc.startsWith('');
notLoc.endWith('');
notLoc.endsWith('');
baseChain.clone();
baseChain.abandon();
notLoc.toString();

// should have only toString method
const abandonedLoc = baseChain.abandon();

abandonedLoc.toString();

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
