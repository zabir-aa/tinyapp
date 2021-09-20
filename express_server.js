const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.set("view engine", "ejs");

// Server initialization

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// GLOBAL OBJECTS

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

let urlDatabase = {
  "9sm5xK": {longURL: "http://www.google.com", userID: "aj48Lw"}, 
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "aj48Lw"}
};

// GLOBAL FUNCTIONS

const generateRandomString = function() {
  random = Math.random().toString(36).slice(2,9)
  return random;
};

const urlsForUser = function(id){
  let selectedURL = {};
  for (url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      selectedURL[url] = urlDatabase[url];
    }
  }
  console.log(selectedURL);
  return selectedURL;
};

const  getUserByEmail = function (email, database) {
  for (let user in database) {
    if (database[user]["email"] === email) {
      return database[user];
    }
  }
};


// GET ROUTES

app.get("/urls", (req, res) => { // the homepage
  const templateVars = { 
    user: users[req.session["user_id"]],
    urls: urlsForUser(req.session["user_id"]) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { // gets the new URL addition page (//urls/new)
  if (req.session["user_id"]) { // checks session to see if user is logged in 
    const templateVars = {  // variable to pass 
    user: users[req.session["user_id"]], // includes the same user_id from session
    urls: urlDatabase }; // and the URL database
  res.render("urls_new", templateVars); //variable being passed to /urls/new template
  } else {
    res.redirect("/login"); // redirect to login page if user is not logged it
  }
});

app.get("/register", (req, res) => { // gets the new user registration page (/register)
  const templateVars = {  // variable to pass
    user: "", // (the user value is for the header to function)
    // urlsø÷˚ø≥÷l : urlDatabase // removed to test
  };
  res.render("user_register", templateVars); // variable being passed to /register template
});


app.get("/login", (req, res) => { // gets the user login page (/login)
  const templateVars = { // variable to pass
    user: users[req.session["user_id"]],
    urls: urlDatabase };
  res.render("user_login", templateVars); // variable being passed to /login template
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[req.session["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});


// POST ROUTES

app.post("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session["user_id"]}
  console.log(urlDatabase);
  res.redirect(`/urls`);
});


app.post("/register", (req, res) => {
  let entryValidity = true;
  if (getUserByEmail(req.body.email, users) || req.body.email === "" || req.body.password === "") {
    entryValidity = false;
  }
  console.log("VALIDITY: ", entryValidity)
  if (entryValidity === false) {
    res.status(400).send();
  } else {
    let userID = generateRandomString();
    hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[userID] = {
    id: userID, 
    email: req.body.email, 
    password: hashedPassword
    }
    console.log("PRINTING req.session:\n", req.session);
    req.session["user_id"] = userID;
    console.log("PRINTING REQ.SESSION:\n",req.session["user_id"])
    res.redirect(`/urls`);
  }
});

/*
app.post("/login", (req, res) => {
  for (let user in users) {
    if (req.body.email === users[user]["email"] && bcrypt.compareSync(req.body.password, users[user]["password"])) {
      req.session.user_id = users[user]["id"];
      return res.redirect("/urls");
    }
  }
  return res.status(403).send();
});
*/


app.post("/login", (req, res) => {
  user = getUserByEmail(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user["password"])) {
      req.session.user_id = user["id"];
      return res.redirect("/urls");
  }
  }
  return res.status(403).send();
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if( Object.keys(urlsForUser(req.session.user_id)).includes(req.params.shortURL)) {
    console.log ("urlsForUser: ", urlsForUser(req.session.user_id), "req.params.shortURL: ", req.params.shortURL);
    let toEdit = req.params.shortURL;
    urlDatabase[toEdit]["longURL"] = req.body.longURL;
    console.log(urlDatabase);
    res.redirect(`/urls/`);
  } else {
    res.status(403).send();
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if( Object.keys(urlsForUser(req.session.user_id)).includes(req.params.shortURL)) {
    let toDelete = req.params.shortURL;
    delete urlDatabase[toDelete];
    res.redirect("/urls");
  } else {
    res.status(403).send();
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
