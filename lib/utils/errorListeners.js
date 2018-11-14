const errorEvents = ['uncaughtException', 'unhandledRejection'];

/**
 * Pauses all global error listeners so that nothing kills the REPL
 */
function pauseErrorListeners() {
	const errorListeners = {};

	errorEvents.forEach(event => {
		if (!errorListeners[event])
			errorListeners[event] = process.rawListeners(event).map(one => one);

		process.removeAllListeners(event);
		process.on(event, err => console.error(err));
	});

	return errorListeners;
}

/**
 * Resumes all previously paused error listeners (after REPL has ended).
 */
function restoreErrorListeners(errorListeners) {
	if (!errorListeners)
		return;

	errorEvents.forEach(event => {
		if (errorListeners[event]) {
			process.removeAllListeners(event);
			errorListeners[event].forEach(func => process.on(event, func));
		}
	});
}

module.exports = {
	pauseErrorListeners,
	restoreErrorListeners,
};
