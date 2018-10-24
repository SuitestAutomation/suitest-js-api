/* istanbul ignore file */

const mockSpawn = require('mock-spawn');
const cp = require('child_process');

const spawn = {...cp.spawn};

module.exports = {
	mock: () => cp.spawn = mockSpawn(),
	restore: () => cp.spawn = {...spawn},
};
