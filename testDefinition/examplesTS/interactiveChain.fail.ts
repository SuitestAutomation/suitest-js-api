import * as suitest from '../../index';

const {interactive} = suitest;

const illegalVarsRepl = interactive({vars: "string"});
illegalVarsRepl.then();
