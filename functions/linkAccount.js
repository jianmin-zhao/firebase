'use strict';


'use strict';
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const cors = require('cors');

const app = express();

//app.set('views', path.join(__dirname, 'views'));
app.use(cors()); 
app.engine('handlebars', exphbs({defaultLayout: 'mainlayout'}));
app.set('view engine', 'handlebars');

app.get('/linkAccount', (req, res) => {

    // "?un=" + form.u.value + "&pwd=" + form.p.value + "&id={{sessionid}}"
	var session = {}
  var id  = req.query.id;

  console.log( "Receive session.id = " + id );
  


    res.redirect("RequestToken");
});

exports.handler = app;



// This HTTPS endpoint can only be accessed by your Firebase Users.
// Requests need to be authorized by providing an `Authorization` HTTP header
// with value `Bearer <Firebase ID Token>`.
/*exports.handler = (request, response) => {

  console.log( "linkAccount request.query =" + JSON.stringify( request.query ) );

  const hours = (new Date().getHours() % 12) + 1 // london is UTC + 1hr;
  var html = `<h1>AJAX</h1>
<p>AJAX is not a programming language.</p>
<p>AJAX is a technique for accessing web servers from a web page.</p>
<p>AJAX stands for Asynchronous JavaScript And XML.</p>`;
  //response.status(200).send( html );

  /*  res.render('user', {
    user: req.user
  });

};*/