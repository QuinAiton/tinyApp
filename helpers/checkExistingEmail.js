const checkExistingEmail = (email, database) => {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
    }
  }
  return false;
};


module.exports = checkExistingEmail;