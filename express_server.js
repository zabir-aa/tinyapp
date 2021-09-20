//EXPRESS
const express = require("express");
const app = express();
app.set("view engine", "ejs");
const PORT = 8080; // default port 8080

//COOKIE-SESSION MIDDLEWARE
let cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
// BODYPARSER
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
// BCRYPT
const bcrypt = require('bcrypt');

// Server initialization
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// HELPER FUNCTIONS
const {getUserByEmail} = require('./helpers');
const {generateRandomString} = require('./helpers');
const {urlsForUser} = require('./helpers');

// DATABASE
const {users} = require('./database');
const {urlDatabase} = require('./database');

// GET ROUTES

app.get("/urls", (req, res) => { // the homepage
  const templateVars = {
    user: users[req.session["user_id"]],
    urls: urlsForUser(req.session["user_id"], urlDatabase) };
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
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session["user_id"]};
  console.log(urlDatabase);
  res.redirect(`/urls`);
});


app.post("/register", (req, res) => {
  let entryValidity = true;
  if (getUserByEmail(req.body.email, users) || req.body.email === "" || req.body.password === "") {
    entryValidity = false;
  }
  console.log("VALIDITY: ", entryValidity);
  if (entryValidity === false) {
    res.status(400).send();
  } else {
    let userID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session["user_id"] = userID;
    res.redirect(`/urls`);
  }
});


app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, users[user]["password"])) {
      req.session["user_id"] = users[user]["id"];
      return res.redirect("/urls");
    }
  }
  return res.status(403).send();
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (Object.keys(urlsForUser(req.session.user_id, urlDatabase)).includes(req.params.shortURL)) {
    let toEdit = req.params.shortURL;
    urlDatabase[toEdit]["longURL"] = req.body.longURL;
    res.redirect(`/urls/`);
  } else {
    res.status(403).send();
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (Object.keys(urlsForUser(req.session.user_id, urlDatabase)).includes(req.params.shortURL)) {
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
