const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const logger = require('./utils/logger');

//
// Environment variable checking
//
if(config.database == undefined || config.database == ""){
  logger.log(2, "The environment variable: DOCKSKID_DB_PATH was not set! Please set it then restart the app.");
  process.exit(1);
}
else if(config.secret == undefined || config.secret == ""){
  logger.log(2, "The environment variable: DOCKSKID_DB_PASSWORD was not set! Please set it then restart the app.");
  process.exit(1);
}

//
// Runtime stuff
//
const port = process.env.PORT || 8080;
const db_path = config.database.replace('<password>', config.secret);

//
// MongoDB stuff
//
logger.log(0, 'Attempting to connect to: ' + db_path);

mongoose.Promise = global.Promise;
mongoose.connect(db_path, { socketTimeoutMS: 5000, keepAlive: true, reconnectTries: 3, useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', function(){
  logger.log(4, 'Succesfully connected to the database!');
})

mongoose.connection.on('error', function(e){
  logger.log(2, 'There was a problem connecting to the database:\n\t' + e);
  process.exit(1)
});

//
// App + CORS stuff
//
const app = express();
const users = require('./routes/users');
app.use(cors());

//
// Middleware
//
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.json());
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

//
// User routing
//
app.use('/u', users);

//
// Start the app
//
app.get('/', function(req, res){
  res.send('Invalid endpoint!');
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, function(){
  logger.log(4, "Server started on port: " + port, write_out=false);
});
