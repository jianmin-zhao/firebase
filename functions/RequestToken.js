'use strict';

// This HTTPS endpoint can only be accessed by your Firebase Users.
// Requests need to be authorized by providing an `Authorization` HTTP header
// with value `Bearer <Firebase ID Token>`.
exports.handler = (request, response) => {

  console.log( "RequestToken request.query =" + JSON.stringify( request.query ) );

};