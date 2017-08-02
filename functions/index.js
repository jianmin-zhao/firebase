const functions = require('firebase-functions');

// Setup the express .... with handlebars...
 
const ModuleRequestAuthorization = require('./RequestAuthorization');
//const ModuleLinkAccount = require('./linkAccount');
const ModuleRequestToken = require('./RequestToken');
const ModuleMediaLast = require('./MediaLast');

exports.RequestAuth = functions.https.onRequest(ModuleRequestAuthorization.handler);
//exports.linkAccount = functions.https.onRequest(ModuleLinkAccount.handler);
//exports.RequestToken = functions.https.onRequest(ModuleRequestToken.handler);
exports.MediaLast = functions.https.onRequest(ModuleMediaLast.handler);
