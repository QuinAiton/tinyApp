
//packages
const express = require('express'),
  bodyParser = require('body-parser'),
  cookieSession = require('cookie-session'),
  bcrypt = require('bcrypt'),
  app = express(),
  PORT = process.env.PORT || 8080;

// Helper functions
const checkExistingEmail = require('./helpers/checkExistingEmail'),
  urlsForUser = require('./helpers/urlsForUser'),
  generateRandomString = require('./helpers/generateRandomString');


//----------------------------environment set up & middleware
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['lighthouseLabs'],
  maxAge: 24 * 60 * 60 * 1000
}));
//

//---------------------------------database
let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "8pm1jb"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "8pm1jb"
  },
};

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

//-------------------------------------Routes

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/urls', (req, res) => {
  const userUrls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls: userUrls, user: users[req.session.user_id] };
  res.render('urls_index', templateVars);
});

//create routes
app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    let templateVars = { user: users[req.session.user_id] };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post('/urls', (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect('urls/' + shortUrl);
});

//show route
app.get('/urls/:id', (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  res.render('urls_show', templateVars);
});

//Delete Route
app.post('/urls/:id/delete', (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


//update routes
app.get('/urls/:id/update', (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    const templateVars = { name: req.params.id, user: users[req.session.user_id] };
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

//Long URl redirect route
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});


//----------------------------Authentification


//registration routes
app.get('/registration', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render('userRegistration', templateVars);
});

app.post('/registration', (req, res) => {
  const saltRounds = 10;
  const plainPass = req.body.user.password;
  const email = req.body.user.email;
  const uniqueId = generateRandomString();

  if (checkExistingEmail(email, users) === false) {
    bcrypt.hash(plainPass, saltRounds, (err, hash) => {
      if (err) {
        console.log(err)
      } else {
        users[uniqueId] = {
          id: uniqueId,
          email: req.body.user.email,
          password: hash,
        };
        req.session.user_id = uniqueId;
        res.redirect('/urls');
      }
    });
  } else {
    res.status(400).send('That email already exists, Please choose a different one or log into the existing account');
  }
});


//login routes
app.get('/login', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.user.email;
  const plainPass = req.body.user.password;
  const HashPass = checkExistingEmail(email, users).password;
  const key = checkExistingEmail(email, users).id;

  //bcrypt hashpass check
  bcrypt.compare(plainPass, HashPass, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (checkExistingEmail(email, users) && result) {
        req.session.user_id = key;
        res.redirect('/urls');
      } else {
        res.status(403).send('Authourization Denied: please check your credentials');
      }
    }
  });
});

//logout route
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});



//server listener
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
