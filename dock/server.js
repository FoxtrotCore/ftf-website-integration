const api = require('./src/api');
const http = require('http');


const host = 'localhost';
const port = '8080';
const db_path = './data.db';

(async (db_path) => {
    await api.constructor(db_path);
})(db_path);

http.createServer(api.ftfdock).listen(port);
