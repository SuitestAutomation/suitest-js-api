import {networkRequest, NETWORK_METHOD, NETWORK_PROP} from '../../index';

networkRequest().responseMatches(NETWORK_PROP.METHOD, NETWORK_METHOD.GET);
