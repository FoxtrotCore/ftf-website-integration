const express = require('express');
const ftfdock = express();
const gcs = require('./gcs/bucket');
const { log } = require('./utils/logger');
const TokenDB = require('./database');

var logged_in = null;
var buckets =  null;
var bucket = null;
const gcs_base_path = 'renders/streams/';
var ep_table = {}
var db = new TokenDB('tokens.db');
ftfdock.disable('trust proxy');
const common_headers = {
  'Control-Acess': '*'
};

async function handle_bucket_info(req, res) {
  if(logged_in) {
    log('info', 'searching: ' + bucket + '/' + path)
    var search = await gcs.getFilesMeta(bucket, path, true, true);
    const payload = {
      search_results: search,
      logged_in: logged_in
    }
    log('info', 'payload: ' + JSON.stringify(payload));

    res.status(200).json(payload);
  }
  else {
    log('error', 'Invalid GCS credentials!')
    res.status(403).json({msg: 'Invalid GCS credentials!'});
  }
}

async function load_ep_metadata(episode) {
  if(logged_in === null){
    log('warn', 'Not logged into GCS yet, logging in now...');
    logged_in = await gcs.isServiceAccountValidated();
  }

  if(buckets === null){
    log('warn', 'Populating GCS storage info...');
    buckets =  await gcs.getBuckets();
    bucket = buckets[0];
  }

  if(logged_in){
    if(!ep_table.hasOwnProperty(episode)){
      log('info', 'Loading episode #' + episode + ' into the metadata table...');
      const path = gcs_base_path + episode;
      log('debug', 'path: ' + path)
      ep_table[episode] = await gcs.getFilesMeta(bucket, path, true, true);
    }
    else {
      log('info', 'Episode #' + episode + ' is already in the table!');
    }
    return ep_table[episode];
  }
  else {
    log('error', 'Invalid gcs credentials!');
    throw "Invalid gcs credentials!";
  }
}

ftfdock.get('/*', async(req, res) => {
  const user_agent =  req.headers['user-agent'];
  const token = req.headers['authorization'];
  const ep = new Number(req.path.slice(1));
  log('info', 'Got request for ep #' + ep);

  if(isNaN(ep)) {
    log('error', 'Bad request, could not form episode number from path!');
    res.status(404).json({msg: 'Malformed path!'});
  }
  else if(ep > 96 || ep < 0) {
    log('error', 'Bad request, episode number out of range!');
    res.status(404).json({msg: 'Episode out of range!'});
  }
  else if(await db.authenticate(token)) {
    log('info', 'Authenticated user: ' + user_agent);
    var ep_meta = load_ep_metadata(ep);
    log('debug', JSON.stringify(ep_meta));
    res.status(200).json({msg: 'OK Temp'});
  }
  else {
    log('error', 'Failed to authenticate user: ' + user_agent);
    res.status(403).json({msg: 'Access forbidden!'});
  }
});

module.exports.ftfdock = ftfdock;
