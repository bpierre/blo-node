/*
Copyright (c) 2011 Pierre Bertet <bonjour@pierrebertet.net>

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

function blo(conf) {

  var connect = require('connect'),
      Step = require('step'),
      fs = require('fs'),
      Article = require('./blo/article'),
      template = require('./blo/template'),
      cache = require('./blo/cache'),
      articles = [];

  return connect.router(function(app) {

    /* Conf */
    cache.config(conf);
    Article.config(conf);

    /* Articles */

    // Check if an article has been modified
    function checkArticleModified(article, callback) {
      fs.stat(conf.articlesDir + '/' + article.permalink + '.html' , function(err, stats) {
        if (err && err.code === 'ENOENT') {
          callback(err, null);
        } else {
          callback(err, !article.mtime || (article.mtime - stats.mtime !== 0), stats.mtime);
        }
      });
    }

    function loadArticleMetas(article, callback) {
      article.getMetas(function(err, metas) {
        console.log('New meta : ' + metas.title);
        article.metas = metas;
        callback();
      });
    }

    function updateArticleCache(article, callback) {
      Article.get(article.permalink, function(err, newArticle) {
        article = newArticle;
        loadArticleMetas(article, function() {
          article.getContent(function(err, content) {
            cache.set(article.permalink, content, function(err) {
              if (err) throw err;
              callback(article.metas, content);
            });
          }, article.metas);
        });
      });
    }

    function getCachedArticleContent(article, callback) {
      checkArticleModified(article, function(err, modified, mtime) {
        if (err && err.code === 'ENOENT') { // Article does not exists anymore
          console.log('Deleted article: ['+ article.permalink +']');
          if (articles.indexOf(article) !== -1) {
            articles.splice(articles.indexOf(article), 1);
          }
          callback(false);
        } else if (modified) {
          console.log('Update cache: ['+ article.permalink +']');
          updateArticleCache(article, function(metas, content) { // Article modified: update
            article.mtime = mtime;
            article.metas = metas;
            callback(content);
          });
        } else {
          console.log('Cached: ['+ article.permalink +']');
          cache.get(article.permalink, function(err, content) {
            callback(content);
          });
        }
      });
    }

    /* Routes */
    function routes() {

      // Home
      app.get('/', function(req, res, next) {
        var context = {
          blogName: conf.blogName,
          blogLang: conf.lang,
          articles: articles.sort(function(a, b) {
            return b.metas.date - a.metas.date;
          }).slice(0, 10)
        };
        template.render("base", context, conf.skinDir, function(err, body) {
          if (err) throw err;
          template.render("home", context, conf.skinDir, function(err, body) {
            if (err) throw err;
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(body);
          });
        });
      });

      // Article
      app.get('/:title', function(req, res, next) {

        function showArticle(article) {
          getCachedArticleContent(article, function(content) {
            if (content === false) return next(); // does not exist anymore
            var context = {
              blogName: conf.blogName,
              blogLang: conf.lang,
              article: {
                metas: article.metas,
                content: content
              }
            };
            template.render("base", context, conf.skinDir, function(err, body) {
              if (err) throw err;
              template.render("article", context, conf.skinDir, function(err, body) {
                if (err) throw err;
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(body);
              });
            });
          });
        }

        // Try to get the article from the permalinks index
        for (var i = 0; i < articles.length; i++) {
          if (articles[i].permalink === req.params.title) {
            return showArticle(articles[i]);
          }
        }

        // Had a new article been added?
        Article.get(req.params.title, function(err, article) {
          if (err) {
            return next(); // No new article
          } else {
            article.getMetas(function(err, metas) {
              article.metas = metas;
              articles.push(article); // Index article
              return showArticle(article);
            });
          }
        });
      });

      // Media
      app.get('/:title/:media', function(req, res, next) {
        connect.static.send(req, res, next, {
          root: conf.articlesDir,
          path: req.params.title + '/' + req.params.media,
          callback: function(err){
            if (err && err.code === 'ENOENT') {
              return next();
            }
          }
        });
      });
    }

    // Init: Load articles metas
    Article.getPermalinks(function(err, permalinks) {
      function articleLoaded(err, article) {
        article.getMetas(function(err, metas) {
          article.metas = metas;
          articles.push(article); // Index articles
          if (articles.length === permalinks.length) {
            routes(); // All articles loaded: init routes
          }
        });
      }
      for (var i = 0; i < permalinks.length; i++) {
        Article.get(permalinks[i], articleLoaded);
      }
    });
  });
}

module.exports = blo;
