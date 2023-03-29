const express = require("express");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const {users, urlDatabase, getUserByEmail, urlsForUser, generateRandomString} = require('./helpers');
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


// when a GET request is made to the homepage
app.get("/", (req, res) => {
  res.redirect(`/urls`); 
});

// urls page
app.get('/urls', (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if(!user) {
    return res.status(401).send('If you want to see the short URL, please log-in <button type="button" style="border:none; background-color: #ffc107;" class="btn btn-primary"><a href="/login">Login</a></button>');
  }

  const urlsOfUser = urlsForUser(userID);
  const templateVars = { 
    user,
    urls: urlsOfUser
  };  
  res.render("urls_index", templateVars);
});

// delete urls 
app.post('/urls/:id/delete', (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if(!user) {
    return res.status(401).send('If you want to delete this short URL, please log-in <button type="button" style="border:none; background-color: #ffc107;" class="btn btn-primary"><a href="/login">Login</a></button>');
  }
  const urlsOfUser = urlsForUser(userID);
  const templateVars = { 
    user, 
    urls: urlsOfUser
  };  
  if (userID !== urlDatabase[req.params.id]["userID"]) {
    res.status(400).send("Only written user can delete");
    return
  }
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`); 
});

// add new URL 
app.get("/urls/new", (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if(!user) {
    return res.status(401).send('If you want to add the new short URL, please log-in <button type="button" style="border:none; background-color: #ffc107;" class="btn btn-primary"><a href="/login">Login</a></button>');
  }
  const templateVars = { 
    user,
    urls: urlDatabase 
  };  
  
  res.render("urls_new", templateVars);
});

// when submit the add new URL request
app.post("/urls", (req, res) => { 
  const userID = req.session["user_id"];
  const user = users[userID];
  if(!user) {
    return res.status(401).send('If you want to add the new short URL, please log-in <button type="button" style="border:none; background-color: #ffc107;" class="btn btn-primary"><a href="/login">Login</a></button>');
  }
  const urlsOfUser = urlsForUser(userID);
  const templateVars = { 
    user,
    urls: urlDatabase 
  };  

  if(!req.body.longUrl) {
    res.status(400).send('Please provide an URL address <a href="/urls">Try again</a>');
    return;
  }
  const id = generateRandomString();
  urlDatabase[id] = {};
  urlDatabase[id]["longURL"] = req.body.longUrl;
  urlDatabase[id]["userID"] = userID;
  res.redirect(`/urls/${id}`); 
});

app.get('/urls/:id', (req, res) => { 
  const userID = req.session["user_id"];  
  const user = users[userID];
  if(!user) {
    return res.status(401).send('If you want to add the new short URL, please log-in <button type="button" style="border:none; background-color: #ffc107;" class="btn btn-primary"><a href="/login">Login</a></button>');
  }
  const shortId = req.params.id;
  if (!urlDatabase[shortId]) {
    res.status(400).send("URL Doesn't exist");
    return
  }
  const longURL = urlDatabase[shortId]["longURL"];
  const templateVars = { 
    id: req.params.id, 
    longURL, 
    user
  }; 
  if (userID !== urlDatabase[req.params.id]["userID"]) {
    res.status(400).send("Only written user can view");
    return
  }
  
  if(!longURL) {
    res.status(400).send("Sorry there is no page for that short URL");
    return
  }
  res.render("urls_show", templateVars);
});

// Edit long url - 1 if : no input, 2 if : id doesn't match
app.post('/urls/:id', (req, res) => {
  const longURL = req.body.longURL;
  const userID = req.session["user_id"];  
  const user = users[userID];
  if(!user) {
    return res.status(401).send('If you want to edit this short URL, please log-in <button type="button" style="border:none; background-color: #ffc107;" class="btn btn-primary"><a href="/login">Login</a></button>');
  }
  const templateVars = {
    user
  };
  
  const shortId = req.params.id;
  console.log(longURL);

  if(!longURL) {
    res.status(400).send(`Please provide a long URL for edit <a href="javascript:window.history.back();">Try again</a>`);
    return;
  }
  if (userID !== urlDatabase[req.params.id]["userID"]) {
    res.status(400).send("Only written user can edit");
    return
  }
  
  urlDatabase[shortId]["longURL"] = req.body.longURL;
  res.redirect(`/urls/${shortId}`); 
});

// redirect with shortURL
app.get("/u/:id", (req, res) => {
  const shortId = req.params.id;
  if (!urlDatabase[shortId]) {
    res.status(400).send("URL doesn't exist.");
    return
  }
  const longURL = urlDatabase[shortId]["longURL"];
  res.redirect(longURL);
});

// Login & setCookies
app.get('/login', (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if(user) {
    return res.redirect("/urls");
  }
  const templateVars = { 
    user
  };  

  res.render("login", templateVars);
});

// Login POST - 1 if: email or pwd no input, 2 if email or pwd not match
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
    
  if(!email || !password) {
    res.status(400).send('Please provide an email AND a Password <a href="/login">Try again</a>');
    return;
  }
  
  let foundUser = getUserByEmail(email);
  const result = bcrypt.compareSync(password, foundUser.password)
  if (!foundUser || !result) {
    res.status(403).send("Email or Password doesn't match, please check again <a href='/login'>Try again</a>");
  }

  const user = users[foundUser.id];
  req.session.user_id = user.id;
  res.redirect(`/urls`); 
});


// Logout & clearCookies
app.post('/loginout', (req, res) => {
  req.session = null
  res.redirect(`/urls`); 
});

// user resister
app.get('/register', (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  if(user) {
    return res.redirect("/urls");
  }
  const templateVars = { 
    user
  };  
  res.render("register", templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

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
  console.log("user: ", user);
  req.session.user_id = user.id

  res.redirect(`/urls`); 
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});