import {networkRequest, NETWORK_PROP} from '../../index';

networkRequest().responseMatches(NETWORK_PROP.METHOD, Symbol('someSymbol'));
