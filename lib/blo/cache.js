var fs = require('fs'),
    conf = null;

function config(c) {
  conf = c;
}

function set(key, val, callback) {
  if (!conf) {
    return callback(new Error("You must call config() before"));
  }
  fs.writeFile(conf.cacheDir + '/' + key, val, 'utf8', function (err) {
    return callback(err);
  });
}

function get(key, callback) {
  if (!conf) {
    return callback(new Error("You must call config() before"));
  }
  fs.readFile(conf.cacheDir + '/' + key, 'utf8', function (err, data) {
    return callback(err, data);
  });
}

module.exports = {
  set: set,
  get: get,
  config: config
};