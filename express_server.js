const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// set the view engine to ejs
app.set('view engine', 'ejs');
// use res.render to load up an ejs view file

// VER1) respond with "hello world" 
// when a GET request is made to the homepage
app.get("/", (req, res) => {
  // VER1) res.send("Hello!");
  var mascots = [
    { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
    { name: 'Tux', organization: "Linux", birth_year: 1996},
    { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
  ];
  var tagline = "No programming concept is complete without a cute animal mascot.";

  res.render('pages/index', {
    mascots: mascots,
    tagline: tagline
  });
});

// about page
app.get('/about', function(req, res) {
  res.render('pages/about');
});

/***** excersise to creat new path(page)
  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  }); //curl -i http://localhost:8080/hello

  app.get("/set", (req, res) => {
    const a = 1;
    res.send(`a = ${a}`);
  });
  
  app.get("/fetch", (req, res) => {
    res.send(`a = ${a}`);
  });
 */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});