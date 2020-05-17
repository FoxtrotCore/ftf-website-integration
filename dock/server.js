const ftfdock = require('./src/api')
const http = require('http');

const host = 'localhost';
const port = '8080';

http.createServer(ftfdock).listen(port);
