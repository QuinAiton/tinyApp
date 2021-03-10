const checkExistingEmail = (email, database) => {
  return new Promise((resolve, reject) => {
    database
      .find({})
      .then((result) => {
        for (const user of result) {
          if (user.email === email) resolve(user);
        }
        resolve(false);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

module.exports = checkExistingEmail;

// for (const key in database) {
//   console.log(database[key]);
//   if (database[key].email === email) {
//     return database[key];
//   }
// }
// return false;
