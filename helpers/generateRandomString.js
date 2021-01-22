const generateRandomString = () => {
  let randomString = Math.random().toString(36).slice(2);
  return randomString.slice(1, 7);
};

module.exports = generateRandomString;