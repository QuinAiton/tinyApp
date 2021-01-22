const urlsForUser = (id, database) => {
  let userUrls = {};
  for (const key in database) {
    if (database[key].userID === id) {
      userUrls[key] = database[key];
    }
  }
  return userUrls;
};
module.exports = urlsForUser;