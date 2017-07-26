const functions = require('firebase-functions');

// Setup the express .... with handlebars...
 
const ModuleRequestAuthorization = require('./RequestAuthorization');
const ModuleLinkAccount = require('./linkAccount');

exports.RequestAuthorization = functions.https.onRequest(ModuleRequestAuthorization.handler);
exports.linkAccount = functions.https.onRequest(ModuleLinkAccount.handler);