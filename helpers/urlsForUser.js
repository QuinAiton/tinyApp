const urlsForUser = (id, database) => {
  let userUrls = [];
  for (const key of database) {
    if (key.owner.id == id) {
      userUrls.push(key);
    }
  }
  return userUrls;
};
module.exports = urlsForUser;
