//jshint esversion:6
require('dotenv').config(); // environment variable install
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}));

//Create a User database: Step 1 - connect to mongoose w/ default mongodb server
mongoose.connect("mongodb://localhost:27017/userDB", 
{useNewUrlParser: true});

//Step 2 - create schema
// const userSchema = {
//   email: String, 
//   password: String
// };

// Level 2 (Encryption)-Schema is now created from mongoose.Schema class
const userSchema = new mongoose.Schema({
  email: String, 
  password: String
});


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});
// encrypts passwords
// Mongoose encrypts when .save() is called, decrypts when .find() is called

//Step 3 - use schema to create Model; creates users
const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

// Step 4- catch input from POST form for new user registration
app.post("/register", function(req, res) {
  // Use User model to catch input
  const newUser = new User({
    email: req.body.username, 
    password: req.body.password
  });

  //Step 5- save input
  newUser.save(function(err){
    if(err){
      console.log(err)
    } else {
      res.render("secrets");
    }
  });
});

// Login method
app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err) {
      console.log(err);
    } else {
      if (foundUser) { // if user w/ that email exists
        if(foundUser.password===password) { // then check password
          res.render("secrets");          // run secrets page if correct
        }
      }
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});

// *Using mongoose-encryption to encrypt passwords
  // encrypts and authenticates
