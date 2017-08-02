// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;
const functions = require('firebase-functions');

// API.AI actions
const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';
const INTENT_CHANGE_COLOR = 'change.color';

// API.AI parameter names
const PARAMETER_COLOR = 'color';     // Matches JSON result.parameters

// API.AI Contexts/lifespans
const CONFIRMATION_SUGGESTIONS = ['Sure', 'No thanks'];

const NO_INPUTS = [
  'I didn\'t hear that.',
  'If you\'re still there, say that again.',
  'We can stop here. See you soon.'
];

const crypto = require('crypto');
const cipherPassword = 'mediaLast!!!'

function verifyAccessTokenObj(obj) {
    var errMsg = '';
    if (! 'user' in obj) {
        errMsg += '-accessToken missing user info';
    }
    if (! 'expiresAt' in obj) {
        errMsg += '-accessToken missing exiration time';
    }
    if (! 'refresh_token' in obj) {
        errMsg += '-accessToken missing refresh_token';
    }
    return errMsg;
}

exports.handler = function(request, response) {

    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));

    var accessToken = null;

    // Try to get the accessToken from the header

    const auth_header = request.get('Authorization');
    if (auth_header) {
        let authFields = auth_header.split(/ +/);
        if (authFields.length != 2) {
            response.status(401).json({error: 'invalide Authorization header'});
            return;
        }
        // authFields[0] === 'Bearer'
        accessToken = authFields[1];
    }

    if (!accessToken) {
        // Try to get the accessToken from body.
        try {
            accessToken = request.body.originalRequest.data.user.accessToken;
        } catch (exc) {
            console.log('attempt to fetch the accessToken from request body failed');
        }
    }

    var accessTokenObj = null;
    if (accessToken) {
        const decipher = crypto.createDecipher('aes192', cipherPassword);
        let decrypted = decipher.update(accessToken, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        accessTokenObj = JSON.parse(decrypted);
        let errMsg = verifyAccessTokenObj(accessTokenObj);
        if (errMsg.length > 0) {
            response.status(401).json({error: 'invalid access_token'});
            return;
        }
    }

    // assertion: accessTokenObj == null || accessTokenObj is a valid:
    //  accessTokenObj.user
    //  accessTokenObj.expiresAt
    //  accessTokenObj.refresh_token

    if (accessTokenObj) {
        if (accessTokenObj.expiresAt * 1000 < Date.now()) {
            response.status(401).json({error: 'the access_token has expired'});
            return;
        }
    }

    const app = new App({ request, response });

    // Greet the user and direct them to next turn
    function unhandledDeepLinks (app) {
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                    .addSimpleResponse("Welcome to MediaLast! I'd really rather \
          not talk about ${app.getRawInput()} "));                 
            
            // entity ///
            // .addSuggestions(['History', 'Headquarters']));
        } else {
            app.ask(`Welcome to Media Last!`, NO_INPUTS);
        }
    }

    // Say a fact
    function changeColor (app) {
    
        let paramColor = app.getArgument(PARAMETER_COLOR);

        let responsePrefix = 'Sure, '+(accessTokenObj ? accessTokenObj.user : 'I don\'t seem to know you but I\'ll do it')+', '+'changing the color to ';
        app.ask( responsePrefix + paramColor, NO_INPUTS);
    
    }

  
    let actionMap = new Map();
    actionMap.set(UNRECOGNIZED_DEEP_LINK, unhandledDeepLinks);
    actionMap.set(INTENT_CHANGE_COLOR, changeColor);

    app.handleRequest(actionMap);
}
