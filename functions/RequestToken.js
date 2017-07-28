'use strict';
const shortId = require('shortid');
var storage = require('node-persist');
storage.init();

// This HTTPS endpoint can only be accessed by your Firebase Users.
// Requests need to be authorized by providing an `Authorization` HTTP header
// with value `Bearer <Firebase ID Token>`.
exports.handler = (request, response) => {
	// Request Token 
    // client_id=GOOGLE_CLIENT_ID&client_secret=GOOGLE_CLIENT_SECRET&grant_type=authorization_code&code=AUTHORIZATION_CODE
    //
    // Refresh Token
	// client_id=GOOGLE_CLIENT_ID&client_secret=GOOGLE_CLIENT_SECRET&grant_type=refresh_token&refresh_token=REFRESH_TOKEN
	//        
  console.log( "RequestToken request.query =" + JSON.stringify( request.query ) );

  var promise = storage.getItem( request.query.code );

  promise.then( function( snapshot ) 
  {
  	var session = snapshot.val();

  	// create an AccessToken for the response...... 
  	session.accessToken = shortId.generate();
  	session.refreshToken = shortId.generate();

  	storage.setItem( session.id, session );

  	var responseJSON = {
  						token_type: "bearer",
  						access_token: session.accessToken,
  						refresh_token: session.refreshToken,
  						expires_in: 1000000
					};

  	response.send( JSON.stringify( responseJSON ) );
  });
};