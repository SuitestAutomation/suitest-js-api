# Demo set up for Suitest JS API with Mocha test runner

1. You may want create config file instead of passing params directly in console
 or keep them in `package.json` scripts. Suitest supports `.suitestrc` configuration file. It must be json object in `demo`
  folder, example config can be found in `example.suitestrc` and more information about available options
 in [suitest test launcher documentaion](https://suite.st/docs/suitest-api/test-launcher/#launcher-options).
2. Update or remove `test/dummy.test.js`, optionally create more tests in that folder.
3. In terminal navigate to `demo` folder and run `yarn` or `npm i`.
4. Run `yarn run interactive` or `npm run interactive` for interactive mode or
 `yarn run automated` or `npm run automated` for automated.
