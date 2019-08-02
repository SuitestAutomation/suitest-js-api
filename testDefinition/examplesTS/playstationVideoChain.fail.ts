import * as suitest from '../../index';
const {psVideo} = suitest;

// const brsCodeExample = (
// `function test() as Boolean
//     return true
// end function`
// );

psVideo().matchesJS(() => true);
psVideo().matchJS('() => true');
psVideo().not();
psVideo().doesNot();
psVideo().isNot();
psVideo().exist();
psVideo().exists();
psVideo().visible();
psVideo().exists().toString();
psVideo().matchesJS('').toString();
// psVideo().matchesBrightScript(brsCodeExample).toString();
psVideo().click().toString();
psVideo().click().repeat(10).interval(2000).toString();
psVideo().moveTo().toString();
psVideo().matchesRepo('width');
psVideo().timeout(10).not();
