const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");

const generateRandomString = function() {
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += (Math.floor((Math.random() * 9) + 1)).toString();
  }
  return random;
};

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
  "9sm5xK": "http://www.google.com",
  "b2xVn2": "http://www.lighthouselabs.ca",
};

/*
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
*/

app.get("/urls", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    urls: urlDatabase };
  console.log("PRINTING templateVars: \n", templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    urls: urlDatabase };
  res.render("user_register", templateVars);
});


app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    urls: urlDatabase };
  res.render("user_login", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls`);
});

const  matchID = function (req, res, userObject) {
  for (let user in userObject) {
    if (userObject[user]["email"] === (req.body.email) && userObject[user]["password"] === (req.body.password)) {
      return userObject[user]["user_id"];
    }
  }
};
app.post("/register", (req, res) => {
  let entryValidity = true;
  for (let user in users) {
    if (users[user]["email"] === (req.body.email) || req.body.email === "" || req.body.password === "") {
      entryValidity = false;
    }
  }
  console.log("VALIDITY: ", entryValidity)
  if (entryValidity === false) {
    res.status(400).send();
  } else {
    let userID = generateRandomString();
    users[userID] = {
    id: userID, 
    email: req.body.email, 
    password: req.body.password
  }
  //console.log("PRINTING USERS:\n", users);
  res.cookie("user_id", userID)
  //console.log("PRINTING REQ.COOKIES:\n",req.cookies)
  res.redirect(`/urls`);
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let toEdit = req.params.shortURL;
  urlDatabase[toEdit] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let toDelete = req.params.shortURL;
  delete urlDatabase[toDelete];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  for (let user in users) {
    if (users[user]["email"] === (req.body.email) && users[user]["password"] === (req.body.password)) {
      res.cookie(users[user]["user_id"])
    }
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
