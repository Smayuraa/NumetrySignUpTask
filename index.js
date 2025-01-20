const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./modules/user");
const multer = require('multer');
const { storage } = require("./cloudConfig"); 
const upload=multer({storage})
require("dotenv").config();

const app = express();

// Connect to MongoDB Atlas
const atlasdb = process.env.ATLASDB_URL;
mongoose
  .connect(atlasdb, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "views")));
app.set("view engine", "ejs");

// Session setup
app.use(
  session({
    secret: "key", 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, 
  })
);

// Passport.js setup
app.use(passport.initialize());
app.use(passport.session());

// Define Local Strategy for passport
passport.use(
  new LocalStrategy(async function (username, password, done) {
    try {
      const user = await User.findOne({ email: username }); // Assuming 'email' is the username
      if (!user) {
        return done(null, false, { message: "Incorrect username or password." });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect username or password." });
      }

      return done(null, user); // Success
    } catch (err) {
      return done(err);
    }
  })
);

// Serialize user (to store user information in session)
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// Deserialize user (to retrieve user information from session)
passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware for authentication check
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); 
  } else {
    res.redirect("/login"); 
  }
}

// Routes

//signup form
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "signup.html"));
});

// Signup route
app.post("/signup", upload.single('profilePicture'), async (req, res) => {
  const { firstName, middleName, lastName, email, phone, country, state, city, password } = req.body;
  // res.send(req.file)

  // Get the uploaded file's Cloudinary URL
  const profilePictureUrl = req.file ? req.file.path : null;

   

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      middleName,
      lastName,
      email,
      phone,
      country,
      state,
      city,
      password: hashedPassword,
      profilePicture: profilePictureUrl,
    });

    await newUser.save();
    console.log("User registered successfully");
    res.redirect("/login");
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Error saving user", error: error.message });
  }
});

// Login route (render login page)
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Login POST route with passport authentication
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureMessage: true,
  }),
  function (req, res) {
    res.redirect("/dash");
  }
);

// Dashboard route
app.get("/dash", isAuthenticated ,(req, res) => {
  if (req.isAuthenticated()) {
    res.send("Welcome to your dashboard");
  } else {
    res.redirect("/login");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
