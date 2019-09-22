const express = require('express');
const path = require('path');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config/database');
const logger = require('../utils/logger');

function censor(censor) {
  var i = 0;

  return function(key, value) {
    if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value)
      return '[Circular]';

    if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
      return '[Unknown]';

    ++i; // so we know we aren't using the original object anymore

    return value;
  }
}

function str(data){
  return JSON.stringify(data, censor(data));
}

// Register
router.post('/register', async function(req, res, next){
  res.fast_fail = false;
  let new_user = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    privilege: 0,
    is_admin: false
  });

  logger.log(0, "Attempting to register user: " + new_user.username);

  User.hasUsername(new_user.username, function(has_user){
    if(has_user){ // Username is NOT unique
      logger.log(1, "User: " + new_user.name + " tried to register with username: " + new_user.username + " that's already in use");
      return res.json({success: false, msg: 'Username is already in use!'}); }
    else{ // Username is unique
      User.hasEmail(new_user.email, function(has_email){
        if(has_email){ // Email is NOT unique
          logger.log(1, "User: " + new_user.name + " tried to register with email: " + new_user.email + " that's already in use");;
          return res.json({success: false, msg: 'Email is already in use!'}); }
        else{ // Email is unique
          User.addUser(new_user, function(e, user){
            if(e){
              logger.log(2, "Failed to register user: " + new_user.username + "\n\tDatabase error: " + e);
              return res.json({success: false, msg: 'Failed to register user: ' + e}); }
            else{
              logger.log(0, "User succesfully registered:\n\tName: " + new_user.name
                                                      + "\n\tUsername: " + new_user.username
                                                      + "\n\tEmail: " + new_user.email
                                                      + "\n\tPrivilege: " + new_user.privilege
                                                      + "\n\tIs Admin: " + new_user.is_admin);
              return res.json({success: true, msg: 'User successfully registered.'}); }
          });
        }
      });
    }
  });
});

// Authenticate
router.post('/auth', function(req, res, next){
  const username = req.body.username;
  const password = req.body.password;

  logger.log(0, "Authenticating user: " + username);

  User.getUserByUsername(username, function(e, user){
    if(e){ throw e; }
    if(!user){ // Username was incorrect
      logger.log(1, "Username: " + username + " was incorrect!");
      return res.json({success: false, msg: 'Username or password was incorrect!'}); }
    User.comparePassword(password, user.password, function(e, is_match){
      if(e){ logger.log(2, e); throw e; }
      if(is_match){
        const token = jwt.sign(user.toJSON(), config.secret, { expiresIn: 86400 });

        logger.log(0, "User: " + username + " succesfully logged in");

        res.json({
          success: true,
          token: 'JWT ' + token,
          msg: 'Succesfully logged in!',
          user:{
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        });
      }
      else{ // Password was incorrect
        logger.log(1, "Password for user: " + username + " was incorrect!");
        return res.json({success: false, msg: 'Username or password was incorrect!'}); }
    });
  });
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session: false}), function(req, res){
  res.json({user: req.user});
});

module.exports = router;
