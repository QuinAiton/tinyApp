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
const urls = require("./models/urls");
const User = require("./models/users");

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

//-------------------------------------Routes
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  Urls.find({})
    .then((allUrls) => {
      const userURls = urlsForUser(req.session.user_id, allUrls);
      res.render("urls_index", {
        urls: userURls,
        user: req.session.user_id,
      });
    })
    .catch((err) => {
      console.log(err, "error loading urls");
    });
  // const userUrls = urlsForUser(req.session.user_id, Urls.find({}));
});

//create routes
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  let templateVars = { user: Users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  const url = {
    shortURL: shortUrl,
    longURL: req.body.longURL,
    owner: {
      id: req.session.user_id,
    },
  };
  const newUrl = new Urls(url);
  Urls.create(newUrl)
    .then(() => {
      res.redirect("urls/" + shortUrl);
    })
    .catch((err) => {
      console.log("error in url post", err);
    });
});

//show route
app.get("/urls/:id", (req, res) => {
  Urls.findOne({ shortURL: req.params.id })
    .then((result) => {
      res.render("urls_show", result);
    })
    .catch((err) => {
      console.log(err);
    });
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
  res.render("register");
});

app.post("/registration", (req, res) => {
  const saltRounds = 10;
  const newUser = req.body;

  checkExistingEmail(newUser.email, Users).then((user) => {
    if (user) {
      return res
        .status(400)
        .send(
          "That email already exists, Please choose a different one or log into the existing account"
        );
    }
  });

  bcrypt
    .hash(newUser.password, saltRounds)
    .then((hash) => {
      newUser.password = hash;
      const userObj = new Users(newUser);
      Users.create(userObj)
        .then((newlyCreated) => {
          req.session.user_id = newlyCreated.id;
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
  const id = req.session.user_id;
  User.findById(id)
    .then((foundUser) => {
      res.render("login", { user: foundUser });
    })
    .catch((err) => {
      console.log(err, "in login");
    });
});

app.post("/login", (req, res) => {
  const user = req.body.user;
  checkExistingEmail(user.email, Users)
    .then((existingUser) => {
      bcrypt.compare(user.password, existingUser.password).then((result) => {
        if (!checkExistingEmail(user.email, Users) && result) {
          return res
            .status(403)
            .send("Authourization Denied: please check your credentials");
        }
        req.session.user_id = existingUser._id;
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
