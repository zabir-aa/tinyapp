const  getUserByEmail = function (email, database) {
  for (let user in database) {
    if (database[user]["email"] === email) {
      return database[user]["id"];
    }
  }
};

const generateRandomString = function() {
  random = Math.random().toString(36).slice(2,9)
  return random;
};

const urlsForUser = function(id, database){
  let selectedURL = {};
  for (url in database) {
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