const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

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

//
// Website user schema
//
const user_schema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required!"]
  },

  email: {
    type: String,
    required: [true, "Email is required!"]
  },

  username: {
    type: String,
    required: [true, "Username is required"]
  },

  password: {
    type: String,
    required: [true, "Password is requried"]
  },

  privilege: {
    type: Number,
    required: true
  },

  is_admin: {
    type: Boolean,
    required: true
  }
});

const User = module.exports = mongoose.model('User', user_schema);
module.exports.getUserById = function(id, callback){ User.findById(id, callback); }

module.exports.hasUsername = function(username, callback){
  User.findOne({username: username}, function(e, user){
    callback(user != null && user != undefined);
  });
}

module.exports.getUserByUsername = function(username, callback){
  const query = {username: username}
  User.findOne(query, callback);
}

module.exports.hasEmail = function(email, callback){
  User.findOne({email: email}, function(e, user){
    callback(user != null && user != undefined);
  });
}

module.exports.getUserByEmail = function(email, callback){
  const query = {email: email}
  User.findOne(query, callback);
}

module.exports.addUser = function(new_user, callback){
  bcrypt.genSalt(10, function(e, salt){
    bcrypt.hash(new_user.password, salt, function(e, hash){
      if(e){ throw  e; }
      new_user.password = hash;
      new_user.save(callback);
    });
  });
}

module.exports.comparePassword = function(candidate_password, hash, callback){
  bcrypt.compare(candidate_password, hash, function(e, is_match){
    if(e){ throw e; }
    callback(null, is_match);
  });
}
