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


//database
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {
  '2ff4s3': {
    id: '2ff4s3',
    email: 'quinn@hotmail.com',
    password: '1111'
  }
}

//

//-------------------------------------Routes

app.get('/', (req, res) => {
  res.send('hello');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render('urls_index', templateVars);
});

//create routes
app.get('/urls/new', (req, res) => {
  templateVars = { user: users[req.cookies.user_id] }
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect('urls/' + shortUrl);
});

//show route
app.get('/urls/:id', (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies.user_id] };
  res.render('urls_show', templateVars);
});

//Delete Route
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//update routes
app.get('/urls/:id/update', (req, res) => {
  const templateVars = { name: req.params.id, user: users[req.cookies.user_id] };
  res.render('urls_update', templateVars);
});

app.post('/urls/:id', (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL);
});

//----------------------------Authentification

//registration routes
app.get('/registration', (req, res) => {
  templateVars = { user: users[req.cookies.user_id] }
  res.render('userRegistration', templateVars)
})

app.post('/registration', (req, res) => {
  if (checkExistingEmail(req.body.user.email) === false) {
    let uniqueId = generateRandomString();
    users[uniqueId] = {
      id: uniqueId,
      email: req.body.user.email,
      password: req.body.user.password,
    }
    res.cookie('user_id', uniqueId)
    res.redirect('/urls')
  } else {
    res.sendStatus(400)
  }
})

//login routes
app.get('/login', (req, res) => {
  templateVars = { user: users[req.cookies.user_id] }
  res.render('login', templateVars)
})

app.post('/login', (req, res) => {
  if (CheckExistingUser(req.body.user.email, req.body.user.password)) {
    res.cookie('user_id', getExistingKey(req.body.user.email))
    res.redirect('/urls')
  } else {
    res.sendStatus(403)
  }
})

//logout route
app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
})

//Long URl redirect route
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
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
}

//checks user credentials to see if an account already exitsts before loggin in
const CheckExistingUser = (email, password) => {
  for (const key in users) {
    if (users[key].email === email && users[key].password === password) {
      return true;
    }
  }
  return false;
}

//grabs the users id if user already exists
const getExistingKey = (email) => {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key].id;
    }
  }
}

//server
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
