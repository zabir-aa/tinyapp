//EXPRESS
const express = require("express");
const app = express();
app.set("view engine", "ejs");
const PORT = 8080; // default port 8080

//COOKIE-SESSION MIDDLEWARE
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// BODYPARSER
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// BCRYPT
const bcrypt = require('bcrypt');

// HELPER FUNCTIONS
const {getUserByEmail, generateRandomString, urlsForUser} = require('./helpers');

// DATABASE
const {users, urlDatabase} = require('./database');

/*----------------------------*/
// GET ROUTES

app.get("/urls", (req, res) => { // The homepage route
  const templateVars = { // variable to pass to template
    user: users[req.session["user_id"]], // includes the user_id from session
    urls: urlsForUser(req.session["user_id"], urlDatabase) }; // and the URL database
  res.render("urls_index", templateVars); //variable being passed to /urls template
});

app.get("/urls/new", (req, res) => { // gets the new URL addition page (//urls/new)
  if (req.session["user_id"]) { // checks session to see if user is logged in
    const templateVars = {  // variable to pass to template
      user: users[req.session["user_id"]], // includes the same user_id from session
      urls: urlDatabase }; // and the URL database
    res.render("urls_new", templateVars); //variable being passed to /urls/new template
  } else {
    res.redirect("/login"); // redirect to login page if user is not logged it
  }
});

app.get("/register", (req, res) => { // gets the new user registration page (/register)
  const templateVars = {  // variable to pass to template
    user: "", // (the user property is only for the header to function)
  };
  res.render("user_register", templateVars); // variable being passed to /register template
});

app.get("/login", (req, res) => { // gets the user login page (/login)
  const templateVars = { // variable to pass to template
    user: users[req.session["user_id"]], // includes the user_id from session
    urls: urlDatabase }; // and the URL database
  res.render("user_login", templateVars); // variable being passed to /login template
});

app.get("/urls/:shortURL", (req, res) => { // gets the shortURL view / edit page (/urls/:shortURL)
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL]) { // checks if shortURL exists for the user
    const templateVars = { // variable to pass to template
      shortURL: req.params.shortURL, // includes the shortURL from user request
      longURL: urlDatabase[req.params.shortURL]["longURL"], // also the associated longURL from urlDatabase
      user: users[req.session["user_id"]], // and the specicic user object filtered from database with session "user_id"
    };
    res.render("urls_show", templateVars); // variable being passed to /urls/:shortURL template
  } else {
    const errorMessage = {
      title: "Error 404: Not Found",
      message: "The requested short URL does not exist for this user!"
    }
    return res.render("error_display", errorMessage); // Send error : 404 in case of nonexistent entry
  }
  
});

app.get("/u/:shortURL", (req, res) => { // the redirect to longURL route (/u/:shortURL)
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL]) { // // Checks if the shortURL exists in the urlDatabase
    const longURL = urlDatabase[req.params.shortURL]["longURL"]; // find associated longURL from the urlDatabase with the shortURL from user request
    res.redirect(longURL); // redirect to longURL (primary action of the service)
  } else {
    const errorMessage = {
      title: "Error 404: Not Found",
      message: "The requested short URL does not exist for this user!"
    }
    return res.render("error_display", errorMessage); // Sends error:404 for nonexistent shortURL
  }
});

/*----------------------------*/
// POST ROUTES

app.post("/register", (req, res) => { // new user registration request
  if (req.body.email === "") {
    const errorMessage = {
      title: "Error 400: Bad Request",
      message: "You left the email field blank!"
    }
    return res.render("error_display", errorMessage);
  } else if (req.body.password === "") {
    const errorMessage = {
      title: "Error 400: Bad Request",
      message: "You left the password field blank!"
    }
    return res.render("error_display", errorMessage);
  } else if (getUserByEmail(req.body.email, users)) {
    const errorMessage = {
      title: "Error 400: Bad Request",
      message: "This email is already registered! Please try to log in."
    }
    return res.render("error_display", errorMessage);
  }
  //res.status(400).send(); // Send error : 400 in case of invalid entry
  const userID = generateRandomString(); // random user id generator
  const hashedPassword = bcrypt.hashSync(req.body.password, 10); // store hashed password
  users[userID] = { // store new user information to database
    id: userID,
    email: req.body.email,
    password: hashedPassword
  };
  req.session["user_id"] = userID; // set cookie for new user
  res.redirect(`/urls`); // rdirect to /urls (homepage)  
});

app.post("/login", (req, res) => { // login request
  const user = getUserByEmail(req.body.email, users); // find user by email
  if (user) { // checks if user exist
    if (bcrypt.compareSync(req.body.password, users[user]["password"])) { // checks if passwords match
      req.session["user_id"] = users[user]["id"]; // sets session cookie
      return res.redirect("/urls"); // redirects to /urls (homepage)
    }
  }
  const errorMessage = {
    title: "Error 403: Forbidden",
    message: "The email / password combination does not match with our records! Please try again."
  }
  return res.render("error_display", errorMessage); // if email or password is mismatched, redirects to error template with error 403 : forbidden
});

app.post("/urls", (req, res) => { // create new shortURL request
  const shortURL = generateRandomString(); // randomly generates the shortURL phrase
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session["user_id"]}; // stores shortURL and associated longURL in urlDatabase
  res.redirect(`/urls`); // redirects to homepage
});

app.post("/u/:shortURL", (req, res) => { // the shortURL show / edit page request
  if (urlDatabase[req.params.shortURL]) { // Checks if the shortURL exists in the urlDatabase
    const shortURL = req.params.shortURL; // fetches the shortURL from user request
    res.redirect(`/urls/${shortURL}`); // redirects user to shortURL view/edit route
  } else {
    const errorMessage = {
      title: "Error 404: Not Found",
      message: "The requested short URL does not exist for this user!"
    }
    return res.render("error_display", errorMessage); // Sends error:404 for nonexistent shortURL for user
  }
  
});

app.post("/urls/:shortURL/edit", (req, res) => { // shortURL edit request
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL]) { // checks if the owner user is making the request
    const toEdit = req.params.shortURL; // fetches the shortURL to be edited from request
    urlDatabase[toEdit]["longURL"] = req.body.longURL; // replaces the associated longURL in database with user entry
    res.redirect(`/urls/`); // redirects to homepage
  } else {
    const errorMessage = {
      title: "Error 403: Forbidden",
      message: "You are not authorized to make this request!"
    }
    return res.render("error_display", errorMessage); // in case of unauthorized user, sends 403: forbidden error
  }
});

app.post("/urls/:shortURL/delete", (req, res) => { // shortURL record delete request
  if (urlsForUser(req.session.user_id, urlDatabase)[req.params.shortURL]) { // checks if the owner user is making the request
    const toDelete = req.params.shortURL; // fetches the shortURL to be deleted from request
    delete urlDatabase[toDelete]; // deletes the record from urlDatabase
    res.redirect("/urls"); // redirects to homepage
  } else {
    const errorMessage = {
      title: "Error 403: Forbidden",
      message: "You are not authorized to make this request!"
    }
    return res.render("error_display", errorMessage); // in case of unauthorized user, sends 403: forbidden error
  }
});

app.post("/logout", (req, res) => { // session logout request
  req.session = null; // sets session cookie value to null
  res.redirect("/urls"); // redirects to homepage
});

/*----------------------------*/
// Server initialization
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
