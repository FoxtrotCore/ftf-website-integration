const sqlite3 = require('sqlite3');
const tp = require('arc-topromise');

class TokenDB extends sqlite3.Database {
  constructor(db_path) {
    super(db_path);
    this.table = 'tokens';

    (async function(db) {
      const row = await tp.ToPromise(db, db.get, "SELECT name FROM sqlite_master WHERE type='table' AND name = '" + db.table + "';");
      if(row == undefined){
        console.log('Table: \"' + db.table + '\" does not exist!');
        await tp.ToPromise(db, db.run, 'CREATE TABLE tokens(token TEXT PRIMARY KEY);')
      }
    })(this);
  }

  async authenticate(token) {
    const res = await tp.ToPromise(this, this.get, "SELECT * FROM " + this.table + " WHERE token='" + token + "';");
    return res !== undefined;
  }
}

module.exports = TokenDB;
