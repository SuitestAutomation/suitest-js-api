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
		assert.deepStrictEqual(processUserArgs(['John']), [{
			name: 'John',
			age: 18,
		}]);
		assert.deepStrictEqual(processUserArgs(['John', 55, 'any']), [{
			name: 'John',
			age: 55,
		}]);
		assert.deepStrictEqual(processUserArgs([['John']]), [{
			name: 'John',
			age: 18,
		}]);
		assert.deepStrictEqual(processUserArgs([{name: 'John'}]), [{
			name: 'John',
			age: 18,
		}]);
		assert.deepStrictEqual(processUserArgs([[{name: 'John'}]]), [{
			name: 'John',
			age: 18,
		}]);
		assert.deepStrictEqual(processUserArgs([[
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

		assert.deepStrictEqual(processUserArgs(['Test1']), [{name: 'Test1'}]);
		assert.deepStrictEqual(processUserArgs(['Test1', 66]), [{name: 'Test1'}]);
		assert.deepStrictEqual(processUserArgs([{name: 'Test1'}]), [{name: 'Test1'}]);
		assert.deepStrictEqual(processUserArgs([{
			name: 'Test1',
			age: 34,
		}]), [{
			name: 'Test1',
			age: 34,
		}]);
		assert.deepStrictEqual(processUserArgs([
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

	it('makeArgumentsProcessor with hashmap handler', () => {
		const processUserArgs = makeArgumentsProcessor(
			(name, age = 0, eyeColor = 'dark') => ({name, age, eyeColor}),
			({name, age = 0, eyeColor = 'dark'}) => ({name, age, eyeColor}),
			input => 'name' in input,
			(key, value) => ({
				name: key,
				age: value,
				eyeColor: 'dark',
			})
		);

		const strangeName = Symbol('strangeName');

		assert.deepStrictEqual(processUserArgs(['Jhon']), [{name: 'Jhon', age: 0, eyeColor: 'dark'}]);
		assert.deepStrictEqual(processUserArgs(['Maria', 23]), [{name: 'Maria', age: 23, eyeColor: 'dark'}]);
		assert.deepStrictEqual(processUserArgs(['Badu', 73, 'blue']), [{name: 'Badu', age: 73, eyeColor: 'blue'}]);
		assert.deepStrictEqual(
			processUserArgs([strangeName, 55, 'green']),
			[{name: strangeName, age: 55, eyeColor: 'green'}]
		);

		assert.deepStrictEqual(processUserArgs([{name: 'Jhon'}]), [{name: 'Jhon', age: 0, eyeColor: 'dark'}]);
		assert.deepStrictEqual(
			processUserArgs([{name: 'Maria', age: 23}]),
			[{name: 'Maria', age: 23, eyeColor: 'dark'}]
		);
		assert.deepStrictEqual(
			processUserArgs([{name: 'Badu', age: 73, eyeColor: 'blue'}]),
			[{name: 'Badu', age: 73, eyeColor: 'blue'}]
		);
		assert.deepStrictEqual(
			processUserArgs([{name: strangeName, age: 55, eyeColor: 'green'}]),
			[{name: strangeName, age: 55, eyeColor: 'green'}]
		);

		assert.deepStrictEqual(
			processUserArgs([{
				'Jhon': 1,
				'Maria': 23,
				'Badu': 73,
				[strangeName]: 55,
			}]), [
				{name: strangeName, age: 55, eyeColor: 'dark'},
				{name: 'Jhon', age: 1, eyeColor: 'dark'},
				{name: 'Maria', age: 23, eyeColor: 'dark'},
				{name: 'Badu', age: 73, eyeColor: 'dark'},
			]
		);
	});
});

