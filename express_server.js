//packages
const express = require("express"),
  bodyParser = require("body-parser"),
  cookieSession = require("cookie-session"),
  methodOverride = require("method-override"),
  bcrypt = require("bcrypt"),
  mongoose = require("mongoose"),
  app = express(),
  PORT = process.env.PORT || 8080;

// Helper functions
const checkExistingEmail = require("./helpers/checkExistingEmail"),
  urlsForUser = require("./helpers/urlsForUser"),
  generateRandomString = require("./helpers/generateRandomString");

//imported modules
const Users = require("./models/users"),
  Urls = require("./models/urls");

//database initialization
mongoose
  .connect("mongodb://localhost:27017/TinyApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log("Database Error", err);
  });

//----------------------------environment set up & middleware
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  cookieSession({
    name: "session",
    keys: ["lighthouseLabs"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

// ---------------------------------database;
// const urlDatabase = {
//   b2xVn2: {
//     longURL: "http://www.lighthouselabs.ca",
//     userID: "8pm1jb",
//   },
//   "9sm5xK": {
//     longURL: "http://www.google.com",
//     userID: "8pm1jb",
//   },
// };

// const users = {
//   firstname: "quin",
//   lastname: "aiton",
//   username: "QuinAiton",
//   email: "quinn@hotmail.com",
//   password: "$2b$10$NNtEVwY8IaKh3o0UibABYO7Pi/t5xU4VduLCGlNrffawR11g55n8m",
// };

// Users.find({}).then((result) => {
//   console.log(result);
// });

//-------------------------------------Routes
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  // const userUrls = urlsForUser(req.session.user_id, Urls.find({}));
  const templateVars = {};
  res.render("urls_index");
});

//create routes
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  let templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    // userID: req.session.user_id,
  };
  res.redirect("urls/" + shortUrl);
});

//show route
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

//Delete Route
app.delete("/urls/:id", (req, res) => {
  // if (!req.session.user_id === urlDatabase[req.params.id].userID) {
  //   return res.redirect("/login");
  // }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//update routes
app.get("/urls/:id/update", (req, res) => {
  // if (!req.session.user_id === urlDatabase[req.params.id].userID) {
  //   return res.redirect("/login");
  // }
  const templateVars = {
    name: req.params.id,
    user: users[req.session.user_id],
  };
  res.render("urls_update", templateVars);
});

app.put("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls/" + shortURL);
});

//Long URl redirect route
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//----------------------------Authentification

//registration routes
app.get("/registration", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("register", templateVars);
});

app.post("/registration", (req, res) => {
  const saltRounds = 10;
  const uniqueId = generateRandomString();
  const user = req.body.user;

  // if (checkExistingEmail(user.email, users)) {
  //   return res
  //     .status(400)
  //     .send(
  //       "That email already exists, Please choose a different one or log into the existing account"
  //     );
  // }

  bcrypt
    .hash(user.password, saltRounds)
    .then((hash) => {
      user.password = hash;
      const newUser = new Users(user);
      Users.create(newUser)
        .then((newlyCreated) => {
          console.log(newlyCreated);
          req.session.user_id = uniqueId;
          res.redirect("/urls");
        })
        .catch((err) => {
          return console.log("registration err", err);
        });
    })
    .catch((err) => {
      return console.log("error in hash", err);
    });
});

//login routes
app.get("/login", (req, res) => {
  let templateVars = { user: Users[req.session.user_id] };
  res.render("login");
});

app.post("/login", (req, res) => {
  const user = req.body.user;
  checkExistingEmail(user.email, Users)
    .then((existingUser) => {
      bcrypt.compare(user.password, existingUser.password).then((result) => {
        // if (!checkExistingEmail(user.email, users) && result) {
        //   res
        //     .status(403)
        //     .send("Authourization Denied: please check your credentials");
        // }
        req.session.user_id = existingUser.id;
        res.redirect("/urls");
      });
    })
    .catch((err) => {
      console.log(err);
    });

  // if (!checkExistingEmail(user.email, users)) {
  //   return res.redirect("/registration");
  // }
});

//logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//server listener
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
