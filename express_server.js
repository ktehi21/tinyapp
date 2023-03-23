const express = require("express");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
const PORT = 8080; // default port 8080

// set the view engine to ejs
app.set('view engine', 'ejs');
// Translate the Buffer data(encoded) into string that human readable
app.use(express.urlencoded({ extended: true }));
//Generate a random short URL ID (6 alphanumeric characters)
const generateRandomString = function (num) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = ""
  const charactersLength = characters.length;

  for ( let i = 0; i < num ; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const users = {
  abc: {
    id: 'abc',
    email: 'a@a.com',
    password: '1234'
  },
  def: {
    id: 'def',
    email: 'b@b.com',
    password: '1234'
  },
};
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// VER1) respond with "hello world" 
// when a GET request is made to the homepage
app.get("/", (req, res) => {
  // VER1) res.send("Hello!");

// use res.render to load up an ejs view file
  res.redirect(`/urls`); 
});

// urls page
app.get('/urls', (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// delete urls 
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`); 
});

// add new URL 
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// when submit the add new URL request
app.post("/urls", (req, res) => { 
  // Log the POST request body to the console
  // res.redirect("Ok"); // Respond with 'Ok' (we will replace this)
  
  const id = generateRandomString(6);
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
  const templateVars = { id: req.params.id, longURL, username: req.cookies["username"] };
  // if client request non-exist short url?
  if(!longURL) {
    const templateVars = { error: "There is no web page" };
    return res.render("no_page", templateVars);
  }
  res.render("urls_show", templateVars);
});

// Edit long url 
app.post('/urls/:id', (req, res) => {
  const shortId = req.params.id;
  urlDatabase[shortId] = req.body.longURL;
  res.redirect(`/urls/${shortId}`); 
});

// redirect with shortURL
app.get("/u/:id", (req, res) => {
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId];
  // console.log("I am leaving now");
  res.redirect(longURL);
});

// Login & setCookies
app.post('/login', (req, res) => {
  const userName = req.body.username;
  res.cookie('username', userName);
  res.redirect(`/urls`); 
});
// Logout & clearCookies
app.post('/loginout', (req, res) => {
  const userName = req.body.username;
  res.clearCookie('username', userName);
  res.redirect(`/urls`); 
});

// user resister
app.get('/register', (req, res) => {

  const templateVars = { username: req.cookies["username"], email: req.body.email, password: req.body.password };
  res.render("register", templateVars);
});
app.post('/register', (req, res) => {
  const id = generateRandomString(8);
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  users[id] = {"id": id, "email": userEmail, "password": userPassword}
  res.cookie('username', id);
  console.log(users);
  res.redirect(`/urls`); 
});




/***** excersise to creat new path(page)
 const users = {
  abc: {
    id: 'abc',
    email: 'a@a.com',
    password: '1234'
  },
  def: {
    id: 'def',
    email: 'b@b.com',
    password: '1234'
  },
};
 app.get("/hello", (req, res) => {
   const templateVars = { greeting: "Hello World!" };
   res.render("hello_world", templateVars);
 });
 
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