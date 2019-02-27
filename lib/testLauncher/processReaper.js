/* istanbul ignore file */

const children = [];

function registerProcess(childProcess) {
	children.push(childProcess);

	childProcess.on('exit', () => {
		const i = children.indexOf(childProcess);

		if (i !== -1) {
			children.splice(i, 1);
		}
	});
}

function killChildProcesses() {
	let child = children.pop();

	while (child) {
		try {
			if (!child.killed) {
				child.kill('SIGINT');

				// SIGINT will not work if child process has eternal loop
				// or we are in debugging mode in WebStorm
				child.kill('SIGKILL');
			}
		} catch (e) {
			console.warn(`Failed to kill child process: ${child.pid}`);
		}

		child = children.pop();
	}
}

module.exports = {
	registerProcess,
	killChildProcesses,
};
