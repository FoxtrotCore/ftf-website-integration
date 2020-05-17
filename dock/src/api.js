const express = require('express');
const ftfdock = express();
const gcs = require('./gcs/bucket');
const { log } = require('./utils/logger');

const common_headers = {
  'Control-Acess': '*'
}

ftfdock.get('/*', async(req, res) => {
  log('info', 'Got request: ' + req.path);

  const logged_in = await gcs.isServiceAccountValidated();
  const buckets =  await gcs.getBuckets();
  const bucket = buckets[0]
  const path = 'renders' + req.path

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
});

module.exports = ftfdock;
