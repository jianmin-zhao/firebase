'use strict';
const express = require('express');
const exphbs = require('express-handlebars');
const shortId = require('shortid');
var localStorage = require('./LocalStorage');
 
const app = express();
//app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'mainlayout'}));
app.set('view engine', 'handlebars');
console.log("RequestAuthorization - ?client_id=GOOGLE_CLIENT_ID&redirect_uri=REDIRECT_URI&state=STATE_STRING&scope=REQUESTED_SCOPES&response_type=code");

app.get('/*', (req, res) => {
  
  var session = {}
  session.id = shortId.generate();
  session.client_id = req.query.client_id;
  session.redirect_uri = req.query.redirect_uri; 
  session.client_state = req.query.state;
  session.scope = req.query.scope;
  session.response_type = req.query.response_type;

  localStorage.setItem( session.id, session );

   res.render('mainview', {
     		sessionid : session.id
  		});
});

exports.handler = app;