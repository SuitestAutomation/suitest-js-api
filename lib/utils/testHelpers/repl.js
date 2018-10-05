/* istanbul ignore file */

// asset file for testing repl
global.iHaveBeenRequired = ++global.iHaveBeenRequired || 1;

module.exports = {
	repeater: a => a,
	nested: {
		repeater: a => a,
	},
};
