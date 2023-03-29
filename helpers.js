const {users, urlDatabase} = require('./database');

// return matched user info 
const getUserByEmail = function(email) {
  const values = Object.values(users);
  
  for (const user of values) {
    if (user.email === email) {
      return user;
    }
  }
}

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

module.exports = {getUserByEmail, urlsForUser, generateRandomString};