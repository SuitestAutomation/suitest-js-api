/**
 * Context class
 */

class Context {
	constructor() {
		this._context = null;
	}

	get context() {
		return this._context;
	}

	setContext(newContext) {
		this._context = newContext;
	}

	clear() {
		this._context = null;
	}
}

module.exports = Context;
