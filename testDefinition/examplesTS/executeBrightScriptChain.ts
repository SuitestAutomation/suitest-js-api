import * as suitest from '../../index';

const bsCodeExample = (
`function test() as Boolean
    return true
end function`
);

const {executeBrightScript} = suitest;

executeBrightScript('adasd');

executeBrightScript(bsCodeExample).abandon();
executeBrightScript(bsCodeExample).then();
executeBrightScript(bsCodeExample).clone();
executeBrightScript(bsCodeExample).toString();
