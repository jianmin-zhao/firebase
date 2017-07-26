'use strict';
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();

//app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'mainlayout'}));
app.set('view engine', 'handlebars');
console.log("RequestAuthorization - Done");


app.get('/RequestAuthorization', (req, res) => {
  console.log('Signed-in user:', req.user);
  res.render('mainview', {
    user: req.user
  });
});

exports.handler = app;