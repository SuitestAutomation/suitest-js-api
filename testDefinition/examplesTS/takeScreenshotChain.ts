import * as suitest from '../../index';

const {takeScreenshot} = suitest;

// should have all necessary modifiers
const takeScreenshotChain = takeScreenshot();

takeScreenshotChain.toString();
takeScreenshotChain.then(buffer => {
	console.log(buffer.entries());
});
takeScreenshotChain.abandon();

// should have only toString method
const abandonedTakeScreenshot = takeScreenshot().abandon();

abandonedTakeScreenshot.toString();
