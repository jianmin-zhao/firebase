const functions = require('firebase-functions');
var admin = require("firebase-admin");
var sync = require("synchronize");

const localStoragePath = "restricted_access/localstorage";

// Fetch the service account key JSON file contents
const serviceAccount = require("./medialast-a988e-firebase-adminsdk-88utb-84c634a740.json");
const firebaseconfig = require("./firebaseconfig.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: firebaseconfig.databaseURL
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database( localStoragePath );
var ref = db.ref();

/**
 * Returns a Promise with the Firebase ID Token if found in the Authorization or the __session cookie.
 */
exports.getItem = function( key ) {
	return db.ref( localStoragePath + key ).once('value');
}

exports.setItem = function( key, value ) {
     ref.child( key ).set( value );
}

exports.length = 0;

exports.removeItem = function( key ) {
	db.ref( localStoragePath + key ).setValue(null);
}

