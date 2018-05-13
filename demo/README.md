# Demo set up for Suitest JS API with Mocha test runner

1. Copy `.suitestrc.dist` file as `.suitestrc` and fill in it's contents 
with your values according to [documentation](https://suite.st/docs/suitest-api/setup/#environment-setup).
2. Write your tests in `test/` folder. There is an example in `test/dummy.test.js`.
3. In terminal navigate to `demo` folder and run `yarn` or `npm i`.
4. Run `yarn run interactive` or `npm run interactive` for interactive mode or
 `yarn run automated` or `npm run automated` for automated.

# Debugging tests with IDE

**Webstorm**
Create `Node.js` configuration where
1. _Working directory_ path to `/demo` folder.
2. _JavaScript file_ `./node_modules/.bin/suitest`.
3. _Application parameters_ `interactive --inspect-brk=[available port for debugger] ./node_modules/.bin/_mocha --no-timeouts --exit`.

**VS code**
Debug config can be like:
```
{
    "type": "node",
    "request": "launch",
    "name": "Any config name",
    "program": "${workspaceFolder}/demo/node_modules/.bin/suitest",
    "args": [
         "interactive",
         "--inspect-brk=9121",
         "./node_modules/.bin/_mocha",
         "--no-timeouts",
         "--exit"
    ],
    "cwd": "${workspaceFolder}/demo",
    "autoAttachChildProcesses": true
}
```

*In case of windows `node_modules/.bin` folder contains executable files
 that are not javaScript programs so they cannot be launched with `node`
 interpreter instead one can use direct path to javaScript file, e.g. 
 `node_modules/suitest-js-api/lib/testLauncher/index.js` and in case of 
 `mocha` `node_modules/mocha/bin/_mocha`  

# Debugging tests with chrome devtools

1. Run `npm run debug`.
2. Open `http://localhost:[port]/json/list`.
3. Visit path specified in `devtoolsFrontendUrl`.
