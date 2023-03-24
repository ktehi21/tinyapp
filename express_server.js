const express = require("express");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");

const app = express();
app.use(morgan('dev'));
app.use(cookieParser());
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
let user = {};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "abc"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "abc"
  },
  "s8df12": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "def"
  },
  "12gods": {
    longURL: "http://www.google.com",
    userID: "ddd"
  }
};

let templateVars = {};

// returns the URLs where the userID is equal to the id of the currently logged-in user.

const urlsForUser = function(id) {
  const userURL = {};
  for (let shortId in urlDatabase) {
    if(urlDatabase[shortId].userID === id) {
      userURL[shortId] = urlDatabase[shortId]
    }
  }
  return userURL;
}

// VER1) respond with "hello world" 
// when a GET request is made to the homepage
app.get("/", (req, res) => {
  // VER1) res.send("Hello!");

// use res.render to load up an ejs view file
  res.redirect(`/urls`); 
});

// urls page
app.get('/urls', (req, res) => {
  const userID = req.cookies["user_id"];
  const urlsOfUser = urlsForUser(userID);
  templateVars = { 
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
  const userID = req.cookies["user_id"];
  const urlsOfUser = urlsForUser(userID);
  templateVars = { 
    user_id: userID, 
    user, 
    urls: urlsOfUser
  };  
  console.log(userID, "/",urlDatabase[req.params.id])
  if (userID !== urlDatabase[req.params.id]["userID"]){
    res.status(400).send("Only written user can delete");
    return
  }
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`); 
});

// add new URL 
app.get("/urls/new", (req, res) => {
  templateVars = { user_id: req.cookies["user_id"], user, urls: urlDatabase };
  // no login --> login page
  if (!templateVars.user_id){
    res.render("login", templateVars);
  }
  res.render("urls_new", templateVars);
});

// when submit the add new URL request
app.post("/urls", (req, res) => { 
  // Log the POST request body to the console
  // res.redirect("Ok"); // Respond with 'Ok' (we will replace this)
  
  templateVars = { user_id: req.cookies["user_id"], user, urls: urlDatabase };
  // no login --> HTML message
  if (!templateVars.user_id){
    res.status(400).send("If you want to make shorten URL, please log-in");
    return
  }
  if(!req.body.longUrl) {
    res.status(400).send('Please provide an URL address');
    return;
  }
  const id = generateRandomString();
  urlDatabase[id] = {};
  urlDatabase[id]["longURL"] = req.body.longUrl;
  urlDatabase[id]["userID"] = req.cookies["user_id"];
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`); 

});

///// grammar
// Route path: /user/:userId(\d+)
// Request URL: http://localhost:3000/user/42
// req.params: {"userId": "42"}
//↓ :id ':' means placeholder from req.params
app.get('/urls/:id', (req, res) => { 
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId]["longURL"];
  templateVars = { id: req.params.id, longURL, user_id: req.cookies["user_id"], user };

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
  templateVars = {user_id: req.cookies["user_id"], user };

  const shortId = req.params.id;
  urlDatabase[shortId]["longURL"] = req.body.longUrl;
  res.redirect(`/urls/${shortId}`); 
});

// redirect with shortURL
app.get("/u/:id", (req, res) => {
  const shortId = req.params.id;
  const longURL = urlDatabase[shortId]["longURL"];
  // console.log("I am leaving now");
  res.redirect(longURL);
});

// Login & setCookies
app.get('/login', (req, res) => {
  templateVars = { user_id: req.cookies["user_id"], user, urls: urlDatabase };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
    
  //no input
  if(!email || !password) {
    res.status(400).send('Please provide an email AND a Password');
    return;
  }
  
  let foundUser = null;
  for (const userId in users) {
    const logUser = users[userId];
    if (logUser.email === email) { // users{email} === input email
      // we found our user
      foundUser = logUser;
    } 
  }

  if (!foundUser) {
    res.status(403).send("no user with that email found");
  }
  
  const result = bcrypt.compareSync(password, foundUser.password)
  if (!result) {
  // if (foundUser.password !== password) {
    res.status(403).send("password do not match")
  }

  user = users[foundUser.id];
  // console.log(user);
  res.cookie('user_id', foundUser.id);
  
  res.redirect(`/urls`); 
});


// Logout & clearCookies
app.post('/loginout', (req, res) => {
  const userId = req.body.user_id;
  res.clearCookie('user_id', userId);

  res.redirect(`/urls`); 
});

// user resister
app.get('/register', (req, res) => {
  templateVars = { user_id: req.cookies["user_id"], user, urls: urlDatabase };
  res.render("register", templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  let foundUser = null;

  //no input
  if(!email || !password) {
    res.status(400).send('Please provide an email AND a Password');
    return;
  }

  // check the email
  for (const userId in users) {
    const userEmail = users[userId].email;
    if (userEmail === email) { // users{email} === input email
      res.status(400).send('Email already taken');
      return;
    } 
  }

  user = {id, email, password:hash};
  users[id] = user;
  res.cookie('user_id', user.id);
  console.log(user);

  res.redirect(`/urls`); 
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});