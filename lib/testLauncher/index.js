const {SUITEST_LAUNCHER_MAIN_PROCESS} = require('../constants/enviroment');

process.env[SUITEST_LAUNCHER_MAIN_PROCESS] = SUITEST_LAUNCHER_MAIN_PROCESS;

const {buildYargs, addCommandsAndHelp} = require('./buildArgs');
const {getOwnArgs} = require('./processArgs');

const yargs = buildYargs();
const ownArgs = getOwnArgs();

addCommandsAndHelp(yargs);

yargs.config({}).parse(ownArgs);
