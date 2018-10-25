import * as suitest from '../../index';

const brsCodeExample = (
`function test() as Boolean
    return true
end function`
);

const {executeBrightScript} = suitest;

executeBrightScript('adasd');

executeBrightScript(brsCodeExample).abandon();
executeBrightScript(brsCodeExample).then();
executeBrightScript(brsCodeExample).clone();
executeBrightScript(brsCodeExample).toString();
