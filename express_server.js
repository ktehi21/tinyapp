const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// set the view engine to ejs
app.set('view engine', 'ejs');
// Translate the Buffer data(encoded) into string that human readable
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// VER1) respond with "hello world" 
// when a GET request is made to the homepage
app.get("/", (req, res) => {
  // VER1) res.send("Hello!");

// use res.render to load up an ejs view file
  res.render('urls_index');
});

// urls page
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// add new URL 
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
// when submit the add new URL request
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});
//Generate a random shor URL ID (6 alphanumeric characters)
function generateRandomString() {}
///// grammar
// Route path: /user/:userId(\d+)
// Request URL: http://localhost:3000/user/42
// req.params: {"userId": "42"}
app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: "http://www.lighthouselabs.ca" };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
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