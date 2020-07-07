import * as suitest from '../../index';

const {saveScreenshot} = suitest;

// should have all necessary modifiers
const saveScreenshotChain = saveScreenshot('/path/to/file.png');

saveScreenshotChain.toString();
saveScreenshotChain.abandon();

// should have only toString method
const abandonedTakeScreenshot = saveScreenshotChain.abandon();

abandonedTakeScreenshot.toString();
