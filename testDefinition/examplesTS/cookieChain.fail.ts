import * as suitest from '../../index';

const {cookie, COMP} = suitest;

// withProperties example
const cookieChain = cookie('cookieName');
cookieChain.withProperties();
cookieChain.withProperties({});
cookieChain.withProperties([
	{
		property: 'domain1',
		val: 'val',
		type: '=',
	},
	{
		property: 'httpOnly',
		val: 'false',
		type: '=',
	},
	{
		property: 'value',
		val: 'val 2',
		type: COMP.APPROX,
	},
	{
		property: 'domain',
		val: 'some.domain',
		type: 'not existed',
	}
]);

cookieChain.matchesJS('some js').withProperties([]);
cookieChain.withProperties([]).matchJS('some js');
