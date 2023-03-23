const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// set the view engine to ejs
app.set('view engine', 'ejs');
// Translate the Buffer data(encoded) into string that human readable
app.use(express.urlencoded({ extended: true }));
//Generate a random short URL ID (6 alphanumeric characters)
const generateRandomString = function () {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = ""
  const charactersLength = characters.length;

  for ( let i = 0; i < 6 ; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

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
  // Log the POST request body to the console
  // res.redirect("Ok"); // Respond with 'Ok' (we will replace this)
  
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`); 

});

///// grammar
// Route path: /user/:userId(\d+)
// Request URL: http://localhost:3000/user/42
// req.params: {"userId": "42"}
//↓ :id ':' means placeholder from req.params
app.get('/urls/:id', (req, res) => { 
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  const templateVars = { id: req.params.id, longURL };

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