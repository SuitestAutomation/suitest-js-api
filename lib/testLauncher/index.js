#!/usr/bin/env node

require('../utils/sentry/Raven');

const {buildYargs, addCommandsAndHelp} = require('./buildArgs');
const {getOwnArgs} = require('./processArgs');

const yargs = buildYargs();
const ownArgs = getOwnArgs();

addCommandsAndHelp(yargs);

yargs.config({}).parse(ownArgs);
