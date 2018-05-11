const sinon = require('sinon');
const raven = require('../sentry/Raven');

sinon.stub(raven, 'captureException').resolves();
