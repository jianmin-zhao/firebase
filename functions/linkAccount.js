'use strict';

const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const cors = require('cors');
const storage = require('node-persist');
const app = express();

//app.set('views', path.join(__dirname, 'views'));
app.use(cors()); 
app.engine('handlebars', exphbs({defaultLayout: 'mainlayout'}));
app.set('view engine', 'handlebars');

app.get('/*', (req, res) => {

    // "?un=" + form.u.value + "&pwd=" + form.p.value + "&id={{sessionid}}"
	console.log("linkAccount = " + JSON.stringify( req.query ));

	var id  = req.query.id;

	// https://oauth-redirect.googleusercontent.com/r/YOUR_PROJECT_ID?code=AUTHORIZATION_CODE&state=STATE_STRING

  	console.log( "Receive session.id = " + id );
  	var session = storage.getItemSync( id );
  	console.log( "LoadSession = :" + session +":");

  	var url = session.redirect_uri + "?code=" + session.id +"&state=" + session.state;
  	console.log( "RedirectURI = " + url );
    res.redirect( url );
});

exports.handler = app;
