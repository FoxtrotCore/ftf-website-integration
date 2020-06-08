const colors = require('colors');

String.prototype.toTitleCase = function() {
	data = "";
  const pieces = this.split(' ');
  for(word in pieces){ data += pieces[word].charAt(0).toUpperCase() + pieces[word].slice(1).toLowerCase(); if(word != (pieces.length - 1)) { data += " "} }
	return data;
}

module.exports.log = function(mode, message){
	mode = mode.toUpperCase();
  const date = new Date().toISOString();
	const msg = "[" + mode + "] [" + date + "]: " + message;

	switch (mode) {
    case 'INFO': {
              console.log(msg.white);
              break;
		}
		case 'ERROR': {
              console.error(msg.red);
              break;
		}
		case 'WARN': {
							console.log(msg.magenta);
							break;
		}
		case 'DEBUG': {
							console.debug(msg.blue);
							break;
		}
  }
}
