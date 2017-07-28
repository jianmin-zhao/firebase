'use strict';

const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const cors = require('cors');
const storage = require('./LocalStorage');

const app = express();

//app.set('views', path.join(__dirname, 'views'));
app.use(cors()); 
app.engine('handlebars', exphbs({defaultLayout: 'mainlayout'}));
app.set('view engine', 'handlebars');

app.post('/*', (req, res) => {

    // "?un=" + form.u.value + "&pwd=" + form.p.value + "&id={{sessionid}}"
	console.log("linkAccount = " + JSON.stringify( req.query ));

	var id  = req.query.id;

	// https://oauth-redirect.googleusercontent.com/r/YOUR_PROJECT_ID?code=AUTHORIZATION_CODE&state=STATE_STRING

  	console.log( "Receive session.id = " + id );
  	storage.getItem( id ).then( function( snapshot ) {
  		var session = snapshot.val();
  		res.setHeader('Access-Control-Allow-Origin', '*');
    	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD'); // If needed
    	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    	res.setHeader('Access-Control-Allow-Credentials', true); // If needed

		// console.log( "snapshot = " + JSON.stringify( snapshot.val() ) );
  		var url = session.redirect_uri;// + "?code=" + session.id +"&state=" + session.client_state;
  		console.log( "RedirectURI = " + url );
    	res.status( 302 ).redirect( url );	
  	});
 });

exports.handler = app;
