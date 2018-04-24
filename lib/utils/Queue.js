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
		this.concurrency = this.concurrency || this.functions.length;

		return new Promise(res => {
			const onPromiseReject = (rej) => {
				this.inProgress--;
				this.result.push({error: rej});
				next();
			};

			const onPromiseResolve = (res) => {
				this.inProgress--;
				this.result.push({result: res});
				next();
			};

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

			for (let i = 0; i < this.concurrency && this.functions.length; i++) {
				next();
			}
		});
	}
};
