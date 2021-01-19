const express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  PORT = 8080;


//environment set up
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

//database
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

//Routes
app.get('/', (req, res) => {
  res.send('hello');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase)
})

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});


app.get('/urls/new', (req, res) => {
  res.render('urls_new')
})

app.post('/urls', (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect('urls/' + shortUrl)
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] }
  res.render('urls_show', templateVars)
})

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

const generateRandomString = () => {
  let randomString = Math.random().toString(36).slice(2)
  return randomString.slice(1, 7)
}


app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
});