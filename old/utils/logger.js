const fs = require('fs');
const colors = require('colors');
const logc = require('../config/logs');
const logp = logc['logs'];

String.prototype.toTitleCase = function() {
	data = "";
  const pieces = this.split(' ');
  for(word in pieces){ data += pieces[word].charAt(0).toUpperCase() + pieces[word].slice(1).toLowerCase(); if(word != (pieces.length - 1)) { data += " "} }
	return data;
}

module.exports.censor = function(data) {
  var i = 0;
  return function(key, value) {
    if(i !== 0 && typeof(data) === 'object' && typeof(value) == 'object' && data == value) return '[Circular]';
    if(i >= 29) return '[Unknown]';
    ++i;
    return value;
  }
}

module.exports.toCensored = function(data) {
  return JSON.stringify(data, this.censor(data));
}

//
// Checking for preexisting log files
//
const root_path = logc['log_path'];
if (!fs.existsSync(root_path)){ fs.mkdirSync(root_path); }

for(log_path in logp){
  const file_path = logc['log_path'] + logp[log_path];
  const file_exists = fs.existsSync(file_path);
  if(!file_exists){
    now = new Date(); date =  now.toLocaleDateString() + " " + now.toLocaleTimeString();
    fs.appendFileSync(file_path, "------------===| " + log_path.toTitleCase() + ' Log generated on: ' + date + " |===------------\n", {mode: 0o777});
  }
}

module.exports.log = function(mode, message, write_out=true, date=null){
  if(date == null){ now = new Date(); date =  now.toLocaleDateString() + " " + now.toLocaleTimeString(); }
  if(mode >= 0 && mode <= 4){
    switch (mode) {
      case 0: { const msg = "[INFO] [" + date + "]: " + message;
                console.error(msg.blue);
                if(write_out) fs.appendFileSync(root_path + logp.info, msg + "\n", {mode: 0o777});
                break; }
      case 1: { const msg = "[WARN] [" + date + "]: " + message;
                console.warn(msg.yellow);
                if(write_out) fs.appendFileSync(root_path + logp.warn, msg + "\n", {mode: 0o777});
                break; }
      case 2: { const msg = "[ERROR] [" + date + "]: " + message;
                console.error(msg.red);
                if(write_out) fs.appendFileSync(root_path + logp.error, msg + "\n", {mode: 0o777});
                break; }
      case 3: { const msg = "[DEBUG] [" + date + "]: " + message;
                console.debug(msg.orange);
                if(write_out) fs.appendFileSync(root_path + logp.debug, msg + "\n", {mode: 0o777});
                break; }
      case 4: { const msg = "[SUCCESS] [" + date + "]: " + message;
                console.log(msg.green);
                if(write_out) fs.appendFileSync(root_path + logp.access, msg + "\n", {mode: 0o777});
                break; }
    }
  }
  else{ throw "Bad log mode: " + mode; }
}
