'use strict';
const express = require('express');
const exphbs = require('express-handlebars');
const shortId = require('shortid');
const crc = require('crc');
const firebase = require("firebase");
const functions = require('firebase-functions');
const admin = require("firebase-admin");
const bodyParser = require('body-parser');
const crypto = require('crypto');

//
// Firebase accounts
//

// Initialize Firebase
// TODO: Replace with your project's customized code snippet
var config = {
  apiKey: "AIzaSyAYuQnOJDzZdNRhWhglYyH9dKBHjSsU6vE",
  authDomain: "medialast-a988e.firebaseapp.com",
};
firebase.initializeApp(config);

function isValidUser( email, pwd )
{
    firebase.auth().signInWithEmailAndPassword( email, pwd )
        .then(function(userRecord) {
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

//
// Set up the Express engine
//

const app = express();
//app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'mainlayout'}));
app.set('view engine', 'handlebars');
console.log("RequestAuthorization - ?client_id=GOOGLE_CLIENT_ID&redirect_uri=REDIRECT_URI&state=STATE_STRING&response_type=code");

var gClientsInfo = new Map(); // client_id -> { redirect_uri, client_secret }
gClientsInfo.set('GoogleClientID2017', {
    redirect_uri: 'https://oauth-redirect.googleusercontent.com/r/medialast-a988e',
    client_secret: 'mechis2017'
});
gClientsInfo.set('GOOGLE_CLIENT_ID', {
    redirect_uri: 'https://developers.google.com/oauthplayground',
    client_secret: 'CLIENT_SECRET'
});

// Returns the query part of the URL as a dictionary of key-values
//
function queryFromUrl(url) {
    var questionMark = url.indexOf('?');
    if (questionMark === -1) {
        return {}
    }
    var queryStr = url.substring(questionMark + 1);
    var kvs = queryStr.split('&')
    var query = {};
    kvs.forEach((kv) => {
        var eq = kv.indexOf('=');
        if (eq > 0 && eq < kv.length - 1) {
            query[kv.substring(0, eq)] = kv.substring(eq + 1);
        }
    });
    return query;
}

// Verify that the query part of the referer URL is good. A valid query parameters from the referer must have
//   client_id, redirect_uri, response_type
// Returns non-empty error message if invalid.
//
function verifyRefererQuery(refQuery) {
    var errMsg = "";
    if (!refQuery.client_id)
        errMsg += '-missing client_id';
    if (!refQuery.redirect_uri)
        errMsg += '-missing redirect_uri';
    if (!refQuery.response_type)
        errMsg += '-missing response_type';

    return errMsg;
}

var gCurrentUsers = [];
const authCodeValidFor = 10 * 60 * 1000; // 10 minutes
const accessTokenValidFor = 60 * 60 * 1000; // 1 hours
const cipherPassword = 'mediaLast!!!'

class UserAuth {
    constructor(user, password) {
        this.user = user;
        this.password = password;
        this.progress = "start";

        // remove the stale user record of the user name.
        var i = gCurrentUsers.findIndex(function(e){ return e.user === user; });
        if (i >= 0) {
            gCurrentUsers.splice(i, 1);
        }
        gCurrentUsers.push(this);

        this.authCode = null;
        this.authCodeExpiresAt = null;
        this.refresh_token = null;
        this.access_token = null;
        this.access_tokenExpiresAt = null;
    }
    setAuthRequestParams(qp) {
        this.client_id = qp.client_id;
        this.redirect_uri = decodeURIComponent(qp.redirect_uri);
        this.client_state = qp.state;
        this.scope = qp.scope;
        this.response_type = qp.response_type;
    }
    createAuthCode() {
        // pre-condition: this.authCode === null
        var now = new Date();
        this.authCode = crc.crc32(this.user+'/'+now).toString(16);
        this.authCodeExpiresAt = new Date(now.getTime() + authCodeValidFor);
        this.progress = 'auth code issued';
    }
    createAccessToken(refresh =false) {
        const now = new Date();
        this.access_tokenExpiresAt = new Date(now.getTime() + accessTokenValidFor);
        if (! refresh) {
            this.refresh_token = crc.crc32(this.user+'/'+now).toString(16);
            this.progress = 'access token is issued for auth code';
        } else {
            this.progress = 'access token is refreshed';
        }
        const record = {
            user: this.user,
            expiresAt: this.access_tokenExpiresAt.getTime(),
            refresh_token: this.refresh_token
        };
        const jsonRecord = JSON.stringify(record);
        const cipher = crypto.createCipher('aes192', cipherPassword);
        this.access_token = cipher.update(jsonRecord, 'utf8', 'base64');
        this.access_token += cipher.final('base64');
    }
    verifyClient() {
        // verify u.client_id, u.redirect_uri, against gClientsInfo
        var client = gClientsInfo.get(this.client_id);
        if (!client) {
            return "invalid client_id";
        }
        if (this.redirect_uri !== client.redirect_uri) {
            return 'invalid redirect_uri for '+this.client_id;
        }
        return "";
    }
    verifyUserCredential() {
        console.log('verifying user/password '+this.user+'/'+this.password);
        return true;
    }
}

// Setting up middlewares:
//
app.use(bodyParser.json());

// Setting up route handlers:
//
app.get('/auth', (req, res) => {
  res.render('mainview', {
      sessionid : shortId.generate()
  });
});

app.post('/linkAccount', (req, res, next) => {

    var user, password;
    try {
        user = req.body.u;
        password = req.body.p;
    } catch (exc) {
        return next({status: 404, message: 'not received user name or password'});
    }
    res.locals.mlUser = new UserAuth(user, password);
    next();

}, (req, res, next) => {

    const refQuery = queryFromUrl(req.headers.referer);
    console.log('refererQuery in /linkAccount = ', refQuery);

    const errMsg = verifyRefererQuery(refQuery);
    if (errMsg.length > 0) {
        next({status: 400, message: errMsg});
    } else {
        res.locals.mlUser.setAuthRequestParams(refQuery);
        next();
    }

}, (req, res, next) => {

    const errMsg = res.locals.mlUser.verifyClient();
    if (errMsg.length > 0) {
        // client invalid
        next({status: 403, message: errMsg});
    } else {
        next();
    }

}, (req, res, next) => {

    if (!res.locals.mlUser.verifyUserCredential()) {
        next({status: 401, message: 'invalide user name or password'});
    } else {
        next();
    }

}, (req, res, next) => {

    const u = res.locals.mlUser;
    u.createAuthCode();
    var redir = u.redirect_uri + '?code='+u.authCode+'&state='+u.client_state
    res.redirect(302, redir);

});

app.post('/token', (req, res, next) => {

    if (!req.body.client_secret || !req.body.client_id) {
        // Must have client_id, client_secret
        next({status: 400, message: 'missing client_id or client_secret'});
    } else {
        next();
    }

}, (req, res, next) => {

    const clientInfo = gClientsInfo.get(req.body.client_id);
    if (!clientInfo || clientInfo.client_secret !== req.body.client_secret) {
        next({status: 401, message: 'invalid client_id or client_secret'});
    } else {
        next();
    }

}, (req, res, next) => {

    if (req.body.grant_type === 'authorization_code') {
        if (!req.body.code) {
            return next({status: 400, message: 'missing code when grant_type being authorization_code'});
        }
        let u = gCurrentUsers.find(function(e){ return e.authCode == req.body.code; });
        if (!u) {
            return next({status: 404, message: 'invalid authorization code'});
        }
        let now = new Date();
        if (u.authCodeExpiresAt < now) {
            // auth code expired
            return next({status: 401, message: 'the auth code has expired.'});
        }

        u.createAccessToken();
        res.json({
            token_type: 'bearer',
            access_token: u.access_token,
            refresh_token: u.refresh_token,
            expires_in:   3600
        });
    } else if (req.body.grant_type === 'refresh_token') {
        if (!req.body.refresh_token) {
            return next({status: 400, message: 'missing refresh_token when grant_type being refresh_token'});
        }
        let u = gCurrentUsers.find(function(e) {return req.body.refresh_token === e.refresh_token; });
        if (!u) {
            return next({status: 404, message: 'invalid refresh_token'});
        }
        u.createAccessToken(true);
        res.json({
            token_type: 'bearer',
            access_token: u.access_token,
            expires_in:   accessTokenValidFor/1000
        });
    } else {
        res.sendStatus(401);
    }

});


// Error handling
//
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json( {
        error: err.message
    } );
});

exports.handler = app;
