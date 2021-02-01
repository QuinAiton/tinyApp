const assert = require('chai').assert,
  checkExistingEmail = require('../helpers/checkExistingEmail');


let users = {
  "8pm1jb": {
    id: "8pm1jb",
    email: "quinn@hotmail.com",
    password: "$2b$10$NNtEVwY8IaKh3o0UibABYO7Pi/t5xU4VduLCGlNrffawR11g55n8m"
  },
  "8pmwer": {
    id: "8pm1jb",
    email: "bonny@hotmail.com",
    password: "$2b$10$NNtEVwY8IaKh3o0UibABYO7Pi/t5xU4VduLCGlNrffawR11g55n8m"
  }
};

describe('#checkExistingUser', () => {
  it('should return user with id 8pm1jb when using the email quinn@hotmail.com', () => {
    const expected = {
      id: "8pm1jb",
      email: "quinn@hotmail.com",
      password: "$2b$10$NNtEVwY8IaKh3o0UibABYO7Pi/t5xU4VduLCGlNrffawR11g55n8m"
    };
    const actual = checkExistingEmail('quinn@hotmail.com', users);
    assert.deepEqual(actual, expected);
  });
  it('should return false when looking for the email tomHanks@hotmail.com thats not in database', () => {
    assert.isFalse(checkExistingEmail('tomHanks@hotmail.com', users));
  });

  it('should return proper password when checking password assoctiated with the email bonny@hotmail.com', () => {
    const expected = "$2b$10$NNtEVwY8IaKh3o0UibABYO7Pi/t5xU4VduLCGlNrffawR11g55n8m";
    const actual = checkExistingEmail('bonny@hotmail.com', users).password;
    assert.equal(actual, expected);
  });

});
