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
  "9sm5xK": {longURL: "http://www.google.com", userID: "aj48Lw"}, 
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "aj48Lw"}
};

/*
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
*/
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

app.get("/urls", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
    urls: urlsForUser(req.cookies["user_id"]) };
  console.log("PRINTING templateVars: \n", templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = { 
    user: users[req.cookies["user_id"]],
    urls: urlDatabase };
  res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
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
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
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
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]}
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
      console.log("###### users[user][user_id]: ", users[user]["id"])
      res.cookie("user_id", users[user]["id"]);
      res.redirect("/urls");
    } else {
      res.status(403).send();
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  console.log("users after clearcookie: ", users)
  res.redirect("/urls");
});
