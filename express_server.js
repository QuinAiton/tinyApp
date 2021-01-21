
//imports
const express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  app = express(),
  PORT = 8080;



//----------------------------environment set up
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//


//---------------------------------database
let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'aJ48lW'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'aJ48lW'
  },
};

let users = {
  'aJ48lW': {
    id: 'aJ48lW',
    email: 'quinn@hotmail.com',
    password: '1111'
  }
};

//

//-------------------------------------Routes

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  const userUrls = urlsForUser(req.cookies.user_id);
  const templateVars = { urls: userUrls, user: users[req.cookies.user_id] };
  res.render('urls_index', templateVars);
});

//create routes
app.get('/urls/new', (req, res) => {
  if (req.cookies.user_id) {
    let templateVars = { user: users[req.cookies.user_id] };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post('/urls', (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  res.redirect('urls/' + shortUrl);
});

//show route
app.get('/urls/:id', (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies.user_id] };
  res.render('urls_show', templateVars);
});

//Delete Route
app.post('/urls/:id/delete', (req, res) => {
  if (req.cookies.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


//update routes
app.get('/urls/:id/update', (req, res) => {
  if (req.cookies.user_id === urlDatabase[req.params.id].userID) {
    const templateVars = { name: req.params.id, user: users[req.cookies.user_id] };
    res.render('urls_update', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect('/urls/' + shortURL);

});

//----------------------------Authentification

//registration routes
app.get('/registration', (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render('userRegistration', templateVars);
});

app.post('/registration', (req, res) => {
  if (checkExistingEmail(req.body.user.email) === false) {
    let uniqueId = generateRandomString();
    users[uniqueId] = {
      id: uniqueId,
      email: req.body.user.email,
      password: req.body.user.password,
    };
    res.cookie('user_id', uniqueId);
    res.redirect('/urls');
  } else {
    res.sendStatus(400);
  }
});

//login routes
app.get('/login', (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  if (CheckExistingUser(req.body.user.email, req.body.user.password)) {
    res.cookie('user_id', getExistingKey(req.body.user.email));
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

//logout route
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//Long URl redirect route
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//----------------------------Helper functions

//generates random 6 alphanumeric id
const generateRandomString = () => {
  let randomString = Math.random().toString(36).slice(2);
  return randomString.slice(1, 7);
};

//checks user database returns true if user already exists
const checkExistingEmail = (email) => {
  for (const key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};

//checks user credentials to see if an account already exitsts before loggin in
const CheckExistingUser = (email, password) => {
  for (const key in users) {
    if (users[key].email === email && users[key].password === password) {
      return true;
    }
  }
  return false;
};

//grabs the users id if user already exists
const getExistingKey = (email) => {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key].id;
    }
  }
};

//find all url objects created by a given UserId and returns them in a new object
const urlsForUser = (id) => {
  let userUrls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

//server
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
