var firebase = require("firebase");
const functions = require('firebase-functions');
var admin = require("firebase-admin");

// Initialize Firebase
// TODO: Replace with your project's customized code snippet
var config = require(./firebaseconfig.json );

firebase.initializeApp(config);


exports.isValidUser = function( email, pwd )
{
	firebase.auth().signInWithEmailAndPassword( email, pwd ).then(function(userRecord) {
    			// See the UserRecord reference doc for the contents of userRecord.
    			console.log("Successfully logged in user" );
  		})
  		.catch(function(error) {
  				// Handle Errors here.
  				var errorCode = error.code;
  				var errorMessage = error.message;
  				if (errorCode === 'auth/wrong-password') {
    				console.log('Wrong password.');
  				} else {
    				console.log(errorMessage);
  				}
  				console.log(error);
		});

	admin.auth().getUserByEmail(email)
  		.then(function(userRecord) {
    			// See the UserRecord reference doc for the contents of userRecord.
    			console.log("Successfully fetched user data:");//, userRecord.toJSON());
  		})
  		.catch(function(error) {
    		console.log("Error fetching user data:", error);
  		});
}