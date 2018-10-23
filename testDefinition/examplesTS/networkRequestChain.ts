import {networkRequest, NETWORK_METHOD, NETWORK_PROP, COMP} from '../../index';

networkRequest().contains('string');
networkRequest().equal('string');
networkRequest().timeout(1);
networkRequest().wasMade();
networkRequest().willBeMade();
networkRequest().wasMade().not();
networkRequest().willBeMade().not();
networkRequest().toAssert();
networkRequest().equals('test').then(made => made === true);
networkRequest().toString();
networkRequest().then();
networkRequest().abandon();
networkRequest().clone();

const internalError = [
	{name: NETWORK_PROP.METHOD, val: NETWORK_METHOD.POST, type: COMP.START},
	{name: NETWORK_PROP.STATUS, val: 500},
];

networkRequest().requestMatches('propName', 'propVal');
networkRequest().requestMatches('propName', 'propVal', COMP.NOT_CONTAIN);
networkRequest().requestMatches(NETWORK_PROP.STATUS, 200);
networkRequest().requestMatches(NETWORK_PROP.METHOD, NETWORK_METHOD.GET);
networkRequest().requestMatches({name: NETWORK_PROP.BODY, val: 'body'});
networkRequest().requestMatches({name: NETWORK_PROP.BODY, val: 'body', type: COMP.START});
networkRequest().requestMatches(internalError);

networkRequest().responseMatches('propName', 'propVal');
networkRequest().responseMatches(NETWORK_PROP.STATUS, 200);
networkRequest().responseMatches({name: NETWORK_PROP.BODY, val: 'body'});
networkRequest().responseMatches({name: NETWORK_PROP.BODY, val: 'body', type: COMP.START});
networkRequest().responseMatches(internalError);

networkRequest().it.should.with.times;
networkRequest().should.it.with.times;
networkRequest().with.should.it.times;
networkRequest().times.should.with.it;
