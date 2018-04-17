const {element} = require('./elementChain');

const videoChain = () => element({video: true});

module.exports = {
	video: videoChain,
	videoAssert: () => videoChain().toAssert(),
};
