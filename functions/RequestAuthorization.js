'use strict';
const express = require('express');
const exphbs = require('express-handlebars');
const shortId = require('shortid');

const app = express();
//app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'mainlayout'}));
app.set('view engine', 'handlebars');
console.log("RequestAuthorization - ?client_id=GOOGLE_CLIENT_ID&redirect_uri=REDIRECT_URI&state=STATE_STRING&response_type=token");

app.get('/*', (req, res) => {
  
  var session = {}
  session.id = shortId.generate();
  session.client_id = req.query.client_id;
  session.redirect_uri = req.query.redirect_uri; 
  session.client_state = req.query.state;
  session.response_type = req.query.token;

  console.log( "Send session.id = " + session.id );

  res.render('mainview', {
     sessionid : session.id
  });
});

exports.handler = app;