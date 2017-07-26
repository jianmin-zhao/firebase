use strict';

// This HTTPS endpoint can only be accessed by your Firebase Users.
// Requests need to be authorized by providing an `Authorization` HTTP header
// with value `Bearer <Firebase ID Token>`.
exports.handler = (request, response) => {

  console.log( "linkAccount request.query =" + JSON.stringify( request.query ) );

  const hours = (new Date().getHours() % 12) + 1 // london is UTC + 1hr;
  var html = `<h1>AJAX</h1>
<p>AJAX is not a programming language.</p>
<p>AJAX is a technique for accessing web servers from a web page.</p>
<p>AJAX stands for Asynchronous JavaScript And XML.</p>`;
  //response.status(200).send( html );
  response.redirect("http://www.yahoo.com");
  /*  res.render('user', {
    user: req.user
  });
*/

};