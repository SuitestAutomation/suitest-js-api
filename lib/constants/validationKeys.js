const validationKeys = {
	CONFIG_OVERRIDE: Symbol('configOverride'),
	CONFIGURE: Symbol('configure'),
	NON_EMPTY_STRING: Symbol('nonEmptyString'),
	POSITIVE_NUMBER: Symbol('positiveNumber'),
	NON_EMPTY_STRING_OR_UNDEFINED: Symbol('nonEmptyStringOrUndefined'),
	NON_EMPTY_STRING_OR_NUll: Symbol('nonEmptyStringOrNull'),
	ARRAY_OF_BUTTONS: Symbol('arrayOfButtons'),
	ELEMENT_PROP_TYPE: Symbol('elementPropType'),
	OPEN_SESSION: Symbol('openSession'),
	UUID: Symbol('uuid'),
	START_TEST_PACK: Symbol('startTestPack'),
	START_TEST: Symbol('startTest'),
	ELEMENT_SELECTOR: Symbol('elementSelector'),
	ELEMENT_PROPS: Symbol('elementProps'),
	ELEMENT_REPO_PROPS: Symbol('elementRepoProps'),
	REQUEST_MATCHES: Symbol('requestMatches'),
	RESPONSE_MATCHES: Symbol('responseMatches'),
	TEST_LAUNCHER_AUTOMATED: Symbol('testLauncherAutomated'),
	TEST_LAUNCHER_INTERACTIVE: Symbol('testLauncherInteractive'),
	TEST_LAUNCHER_TEST_COMMAND: Symbol('testLauncherTestCommand'),
	SESSION_BOOTSTRAP_AUTOMATED: Symbol('autoBootstrapAutomated'),
	SESSION_BOOTSTRAP_INTERACTIVE: Symbol('autoBootstrapInteractive'),
	UNTIL_CONDITION_CHAIN: Symbol('untilConditionChain'),
	STRING: Symbol('string'),
};

Object.freeze(validationKeys);

module.exports = validationKeys;
