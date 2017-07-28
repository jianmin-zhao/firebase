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

exports.handler = functions.https.onRequest((request, response) => {


  const app = new App({ request, response });
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

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
    }pr
  }

  // Say a fact
  function changeColor (app) {
    
    let paramColor = app.getArgument(PARAMETER_COLOR);

    let responsePrefix = 'Sure, changing the color to ';
    app.ask( responsePrefix + paramColor, NO_INPUTS);
    
  }

  
  let actionMap = new Map();
  actionMap.set(UNRECOGNIZED_DEEP_LINK, unhandledDeepLinks);
  actionMap.set(INTENT_CHANGE_COLOR, changeColor);

  app.handleRequest(actionMap);
});
