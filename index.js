const express = require('express'),
  app = express(),
  PORT = 8080;

app.set('view engine', 'ejs');



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}


app.get('/', (req, res) => {
  res.send('hello');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase)
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`)
});