var jsdom = require("jsdom").jsdom,
    Step = require("step"),
    fs = require('fs'),
    conf = null;

function Article(permalink, rawData) {
  this.permalink = permalink;
  this.rawData = rawData;
}

Article.prototype.domExec = function(callback) {
  jsdom.env(this.rawData, [], callback);
};

Article.prototype.getMetas = function(callback) {
  this.domExec(function(err, window) {
    conf.readMetas(window, function(err, metas) {
      if (err) throw err;
      return callback(err, metas);
    });
  });
};

Article.prototype.getContent = function(callback) {
  this.domExec(function(err, window) {
    conf.readArticle(window, function(err, content) {
      if (err) throw err;
      return callback(err, content);
    });
  });
};

/* Static methods */
Article.config = function(c) {
  conf = c;
};

Article.getPermalinks = function(callback) {
  fs.readdir(conf.articlesDir, function(err, files){
    var permalinks = [];
    for (var i = 0; i < files.length; i++) {
      var permalinkMatch = files[i].match(/^(.+)\.html$/);
      if (permalinkMatch && permalinkMatch.length === 2) {
        permalinks.push(permalinkMatch[1]);
      }
    }
    callback(null, permalinks);
  });
};

Article.get = function(permalink, callback) {
  fs.readFile(conf.articlesDir + '/' + permalink +'.html', 'utf8', function (err, data) {
    if (err) {
      return callback(err);
    }
    return callback(null, new Article(permalink, data));
  });
};

module.exports = Article;