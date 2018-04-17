const assert = require('assert');
const makeArgumentsProcessor = require('../../lib/utils/makeArgumentsProcessor');

describe('makeArgumentsProcessor util', () => {
	const processUserArgs = makeArgumentsProcessor(
		(name, age = 18) => ({
			name,
			age,
		}),
		({name, age = 18}) => ({
			name,
			age,
		})
	);

	it('makeArgumentsProcessor', () => {
		assert.deepEqual(processUserArgs(['John']), [{
			name: 'John',
			age: 18,
		}]);
		assert.deepEqual(processUserArgs(['John', 55, 'any']), [{
			name: 'John',
			age: 55,
		}]);
		assert.deepEqual(processUserArgs([['John']]), [{
			name: 'John',
			age: 18,
		}]);
		assert.deepEqual(processUserArgs([{name: 'John'}]), [{
			name: 'John',
			age: 18,
		}]);
		assert.deepEqual(processUserArgs([[{name: 'John'}]]), [{
			name: 'John',
			age: 18,
		}]);
		assert.deepEqual(processUserArgs([[
			{
				name: 'User1',
				age: 20,
			},
			{
				name: 'User2',
				age: 60,
				phone: '111111',
			},
		]]), [
			{
				name: 'User1',
				age: 20,
			},
			{
				name: 'User2',
				age: 60,
			},
		]);
	});

	it('makeArgumentsProcessor recursion detected', () => {
		const args = [[{name: 'User1'}, {name: 'User2'}]];

		args[0].push(args);
		assert.throws(() => processUserArgs(args));
	});

	it('makeArgumentsProcessor with empty fromObject', () => {
		const processUserArgs = makeArgumentsProcessor((name) => ({name}));

		assert.deepEqual(processUserArgs(['Test1']), [{name: 'Test1'}]);
		assert.deepEqual(processUserArgs(['Test1', 66]), [{name: 'Test1'}]);
		assert.deepEqual(processUserArgs([{name: 'Test1'}]), [{name: 'Test1'}]);
		assert.deepEqual(processUserArgs([{
			name: 'Test1',
			age: 34,
		}]), [{
			name: 'Test1',
			age: 34,
		}]);
		assert.deepEqual(processUserArgs([
			[{
				age: 20,
			},
			{
				name: 'User2',
				age: 60,
				phone: '111111',
			}]]), [
			{
				age: 20,
			},
			{
				name: 'User2',
				age: 60,
				phone: '111111',
			},
		]);
	});
});

