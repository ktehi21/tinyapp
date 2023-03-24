const users = {
  h0fdkc: {
    id: 'h0fdkc',
    email: 'a@a.com',
    password: '$2a$10$FTlSnoom0j2/CN.hkoke/eDlX20uOFYQmbBLbjBcEAI3JHq2b4oNa'
  },
  abgjzj: {
    id: 'abgjzj',
    email: 'b@b.com',
    password: '$2a$10$m/TNVclJzLrkI9o58Ao.f.Wy5oQdzj68VjHMQaRVJeP.yv6P8RZ/G'
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "h0fdkc"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "h0fdkc"
  },
  "s8df12": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "abgjzj"
  },
  "12gods": {
    longURL: "http://www.google.com",
    userID: "abgjzj"
  }
};


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
console.log(getUserByEmail("a@a.com").email);

module.exports = {users, urlDatabase, getUserByEmail, urlsForUser};