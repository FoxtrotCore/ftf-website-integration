const jwt_strategy = require('passport-jwt').Strategy;
const extract_jwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user');
const config = require('../config/database');

module.exports = function(passport){
  let opts = {};
  opts.jwtFromRequest = extract_jwt.fromAuthHeaderWithScheme('jwt');
  opts.secretOrKey = config.secret;

  passport.use(new jwt_strategy(opts, function(jwt_payload, done){
    User.getUserById(jwt_payload._id, function(e, user){
      if(e){ return done(e, false); }
      if(user){ return done(null, user); }
      else{ return done(null, false); }
    });
  }));
}
