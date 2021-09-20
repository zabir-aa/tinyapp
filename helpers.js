//HELPER FUNCTIONS

const  getUserByEmail = function(email, database) { // finds the user by email and returns the user id
  for (let user in database) {
    if (database[user]["email"] === email) {
      return database[user]["id"];
    }
  }
};

const generateRandomString = function() { // generates a six character alphanumeric combination
  let random = Math.random().toString(36).slice(2,9);
  return random;
};

const urlsForUser = function(id, database) { // filters the urlDatabase with user id and returns only the urls created by that user
  let selectedURL = {};
  for (let url in database) {
    if (database[url]["userID"] === id) {
      selectedURL[url] = database[url];
    }
  }
  console.log(selectedURL);
  return selectedURL;
};



module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser};