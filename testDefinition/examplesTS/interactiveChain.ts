import * as suitest from '../../index';

const {interactive} = suitest;

// should have all necessary modifiers
const baseRepl = interactive({});
baseRepl.then();

// can have empty vars
const emptyVarsRepl = interactive({vars: {}});
emptyVarsRepl.then();

// can have vars with values of different types
const a = "foobar";
const b = 5;
const c = {one: "two"};

const varsRepl = interactive({vars: {a, b, c}});
varsRepl.then();
