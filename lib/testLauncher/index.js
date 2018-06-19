#!/usr/bin/env node

require('../utils/sentry/Raven');
const {extend} = require('../../config');

const {buildYargs, addCommandsAndHelp} = require('./buildArgs');
const {getOwnArgs} = require('./processArgs');

// Make sure process knows it's a launcher
extend({runningAsLauncher: true});

const yargs = buildYargs();
const ownArgs = getOwnArgs();

addCommandsAndHelp(yargs);

yargs.config({}).parse(ownArgs);
