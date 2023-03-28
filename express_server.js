const express = require("express");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const {users, urlDatabase, getUserByEmail, urlsForUser} = require('./helpers');
const bcrypt = require("bcryptjs");

const app = express();
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'my-cookie-name',
  keys: ['secret'],
}))
const PORT = 8080; // default port 8080

// set the view engine to ejs
app.set('view engine', 'ejs');
// Translate the Buffer data(encoded) into string that human readable
app.use(express.urlencoded({ extended: true }));
//Generate a random short URL ID (6 alphanumeric characters)
const generateRandomString = function () {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = ""
  const charactersLength = characters.length ;

  for ( let i = 0; i < 6 ; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}






// when a GET request is made to the homepage
app.get("/", (req, res) => {
// use res.render to load up an ejs view file
  res.redirect(`/urls`); 
});

// urls page
app.get('/urls', (req, res) => {
  const user = {};
  const userID = req.session["user_id"];
  const urlsOfUser = urlsForUser(userID);
  const templateVars = { 
    user_id: userID, 
    user, 
    urls: urlsOfUser
  };  
  if (!templateVars.user_id){
    res.status(400).send('If you want to see the short URL, please log-in <button type="button" style="border:none; background-color: #ffc107;" class="btn btn-primary"><a href="/login">Login</a></button>');
    return
  }
  
  res.render("urls_index", templateVars);
});

// delete urls 
app.post('/urls/:id/delete', (req, res) => {
  const user = {};
  const userID = req.session["user_id"];
  const urlsOfUser = urlsForUser(userID);
  const templateVars = { 
    user_id: userID, 
    user, 
    urls: urlsOfUser
  };  
  if (userID !== urlDatabase[req.params.id]["userID"]){
    res.status(400).send("Only written user can delete");
    return
  }
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`); 
});

// add new URL 
app.get("/urls/new", (req, res) => {
  const user = {};
  const templateVars = { 
    user_id: req.session["user_id"], 
    user, 
    urls: urlDatabase 
  };
  // no login --> login page
  if (!templateVars.user_id){
    res.render("login", templateVars);
  }
  res.render("urls_new", templateVars);
});

// when submit the add new URL request
app.post("/urls", (req, res) => { 
  const user = {};
  const templateVars = { 
    user_id: req.session["user_id"], 
    user, 
    urls: urlDatabase 
  };
  if (!templateVars.user_id){
    res.status(400).send("If you want to make shorten URL, please log-in");
    return
  }
  if(!req.body.longUrl) {
    res.status(400).send('Please provide an URL address <a href="/urls">Try again</a>');
    return;
  }
  const id = generateRandomString();
  urlDatabase[id] = {};
  urlDatabase[id]["longURL"] = req.body.longUrl;
  urlDatabase[id]["userID"] = req.session["user_id"];
  res.redirect(`/urls/${id}`); 
});

app.get('/urls/:id', (req, res) => { 
  const user = {};
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId]["longURL"];
  const templateVars = { 
    id: req.params.id, 
    longURL, 
    user_id: req.session["user_id"], 
    user 
  };

  if (!templateVars.user_id || !urlsForUser(shortId) ){
    res.status(400).send("Only relavent user can change it");
    return
  }
  
  // if client request non-exist short url?
  if(!longURL) {
    res.status(400).send("Sorry there is no page for that short URL");
    return
  }
  res.render("urls_show", templateVars);
});

// Edit long url 
app.post('/urls/:id', (req, res) => {
  const user = {};
  const templateVars = {
    user_id: req.session["user_id"], 
    user 
  };

  const shortId = req.params.id;
  urlDatabase[shortId]["longURL"] = req.body.longUrl;
  res.redirect(`/urls/${shortId}`); 
});

// redirect with shortURL
app.get("/u/:id", (req, res) => {
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId]["longURL"];
  res.redirect(longURL);
});

// Login & setCookies
app.get('/login', (req, res) => {
  const user = {};
  const templateVars = { 
    user_id: req.session["user_id"], 
    user, 
    urls: urlDatabase 
  };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
    
  //no input
  if(!email || !password) {
    res.status(400).send('Please provide an email AND a Password <a href="/login">Try again</a>');
    return;
  }
  
  let foundUser = null;
  for (const userId in users) {
    const logUser = users[userId];
    if (logUser.email === email) {
      foundUser = logUser;
    } 
  }

  if (!foundUser) {
    res.status(403).send("no user with that email found <a href='/login'>Try again</a>");
  }
  const result = bcrypt.compareSync(password, foundUser.password)
  if (!result) {
    res.status(403).send("password do not match <a href='/login'>Try again</a>")
  }

  const user = users[foundUser.id];
  req.session.user_id = user;
  res.redirect(`/urls`); 
});


// Logout & clearCookies
app.post('/loginout', (req, res) => {
  const userId = req.body.user_id;
  req.session = null

  res.redirect(`/urls`); 
});

// user resister
app.get('/register', (req, res) => {
  const user = {};
  const templateVars = { 
    user_id: req.session["user_id"], 
    user, 
    urls: urlDatabase 
  };
  res.render("register", templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  // let foundUser = null;

  //no input
  if(!email || !password) {
    res.status(400).send('Please provide an email AND a Password <a href="/register">Try again</a>');
    return;
  }

  // check the email
  if (getUserByEmail(email)) {
    return res.send("Email exists! Please <a href='/register'>Try again</a>")
  }

  const user = {id, email, password:hash};
  users[id] = user;
  console.log("user.id: ", user.id);
  req.session.user_id = user.id

  res.redirect(`/urls`); 
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});