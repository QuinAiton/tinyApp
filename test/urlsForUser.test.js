const assert = require('chai').assert,
  urlsForUser = require('../helpers/urlsForUser');

let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "8pm1jb"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "8pm1jb"
  },
  "9sm35K": {
    longURL: "http://www.google.com",
    userID: "111g11"
  },
};


describe('#urlsForUser', () => {
  it('should return both urls matching the users id 8pm1jb ', () => {
    const expected = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "8pm1jb"
      },
      "9sm5xK": {
        longURL: "http://www.google.com",
        userID: "8pm1jb"
      }
    }
    const actual = urlsForUser("8pm1jb", urlDatabase);
    assert.deepEqual(actual, expected);
  });
  it('should return an empty object when no items match user id 8pmeyb', () => {
    const expected = {};
    const actual = urlsForUser("8pmeyb", urlDatabase);
    assert.deepEqual(actual, expected);
  });
  it('should return 1 object matching the user id 111g11 ', () => {
    const expected = {
      "9sm35K": {
        longURL: "http://www.google.com",
        userID: "111g11"
      }
    }
    const actual = urlsForUser("111g11", urlDatabase);
    assert.deepEqual(actual, expected);
  });
})
