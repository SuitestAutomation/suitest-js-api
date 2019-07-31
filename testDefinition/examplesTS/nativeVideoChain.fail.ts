import * as suitest from '../../index';
const {nativeVideo} = suitest;

// const brsCodeExample = (
// `function test() as Boolean
//     return true
// end function`
// );

nativeVideo().matchesJS(() => true);
nativeVideo().matchJS('() => true');
nativeVideo().not();
nativeVideo().doesNot();
nativeVideo().isNot();
nativeVideo().exist();
nativeVideo().exists();
nativeVideo().visible();
nativeVideo().exists().toString();
nativeVideo().matchesJS('').toString();
// nativeVideo().matchesBrightScript(brsCodeExample).toString();
nativeVideo().click().toString();
nativeVideo().click().repeat(10).interval(2000).toString();
nativeVideo().moveTo().toString();
nativeVideo().matchesRepo('width');
nativeVideo().timeout(10).not();
