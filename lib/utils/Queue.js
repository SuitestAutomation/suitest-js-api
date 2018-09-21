const {curry} = require('ramda');

module.exports = class Queue {
	constructor(concurrency) {
		this.functions = [];
		this.result = [];
		this.inProgress = 0;
		this.concurrency = concurrency;
	}

	push(func) {
		this.functions.push(func);
	}

	start() {
		const threadsCount = this.concurrency > 0 ? this.concurrency : this.functions.length;

		return new Promise(res => {
			const baseHandler = curry((handler, data) => {
				this.inProgress--;
				handler(data);
				next();
			});
			const onPromiseReject = baseHandler(error => this.result.push({error}));
			const onPromiseResolve = baseHandler(result => this.result.push({result}));

			const next = () => {
				if (!this.functions.length && this.inProgress === 0) {
					res(this.result);
					this.result = [];
				} else if (this.functions.length) {
					const func = this.functions.shift();

					this.inProgress++;
					func()
						.then(onPromiseResolve)
						.catch(onPromiseReject);
				}
			};

			for (let i = 0; i < threadsCount; i++) {
				next();
			}
		});
	}
};
