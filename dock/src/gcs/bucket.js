const { Storage } = require('@google-cloud/storage');
const path = require('path');

const AUTH_FILE_PATH = path.join(process.env.HOME, "/.ssh/ftf-gcs-key.json");

const storage = new Storage({
    projectId: 'foxtrotcore',
    keyFilename: AUTH_FILE_PATH,
});

module.exports = {
  /**
   * isServiceAccountValidated - Checks whether you are authenticated.
   * If this fails, nothing else is going to work.
   * Make sure your key is in your `~/.ssh/` dir.
   *
   * @return {Boolean} True if authenticated, False otherwise.
   */
  isServiceAccountValidated: async function() {
    const [buckets] = await storage.getBuckets();
    return buckets.length != 0;
  },
  /**
   * getBuckets - Gets a list of all available bucket names.
   *
   * @return {Object} Array of Strings, representing all bucket names.
   */
  getBuckets: async function() {
    const [buckets] = await storage.getBuckets();
    var bucket_names = [];
    buckets.forEach(bucket => {
      bucket_names.push(bucket.name);
    });
    return bucket_names;
  },
  /**
   * getFilesInDir - Gets all file metadata in a directory.<br>
   * Metadata keys:<br>
   * bucket<br>
   * contentType<br>
   * crc32c<br>
   * etag<br>
   * eventBasedHold<br>
   * generation<br>
   * id<br>
   * kind<br>
   * md5Hash<br>
   * mediaLink<br>
   * metageneration<br>
   * name<br>
   * selfLink<br>
   * size<br>
   * storageClass<br>
   * timeCreated<br>
   * timeStorageClassUpdated<br>
   * updated<br>
   *
   * @param  {String} bucketName The bucket the directory is in.
   * @param  {String} dir The directory to get the files from. Null for root
   * directory.
   * @param  {Boolean} getSubDirs True to include files in subdirectories.
   * @param  {Boolean} includeDir True to include directory metadata.
   * @return {Object} Array of Objects. Each Object has the metadata of a file.
   */
  getFilesMeta: async function(bucketName, dir, includeSub, includeDir) {
    // If we're looking for a directory, we can let Google filter for us
    var options = null;
    if (dir !== null) {
      var options = {
        prefix: dir
      };
      // If a delimiter is specified, subdirs will not be included.
      // See https://cloud.google.com/storage/docs/listing-objects
      if (!includeSub) {
        options.delimiter = '/';
      }
    }

    // To determine if a file is in a subdir, we need to ignore the prefix
    // if it was specified. The easiest way to do this is to cache the number of
    // characters to ignore.
    var dir_length = 0;
    if (dir !== null) {
      dir_length = dir.length;
    }

    const [files] = await storage.bucket(bucketName).getFiles(options);

    // From here, we have to manually filter the files.
    // If a file name ends in "/" it's a directory.
    // If a file name, excluding the characters up to the search directory,
    // has a "/" within it but not at the end, it is in a subdirectory.
    // For example, if we're searching in the "sample/" dir, the file
    // "sample/test/file.txt" is in a subdirectory, but "sample/test/" itself
    // is not. The includeDir flag is intended to catch this situation if
    // desired.

    // Calculate characters to ignore`
    var dir_length = 0;
    if (dir !== null) {
      dir_length = dir.length;
    }

    // Initialize array to return data in
    var filesData = []
    // Filter
    files.forEach(file => {
      var nameInDir = file.name.slice(dir_length)
      var isDir = file.name[file.name.length - 1] === '/';
      var isSub = nameInDir.indexOf('/') !== -1
        && nameInDir.indexOf('/') !== nameInDir.length - 1;
      if ((!isDir || includeDir) && (!isSub || includeSub)) {
        filesData.push(file.metadata);
      }
    });

    return filesData;
  }
}
