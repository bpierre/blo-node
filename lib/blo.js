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

function blo(dir) {
  
  var connect = require('connect'),
      Step = require('step'),
      Article = require('./blo/article'),
      template = require('./blo/template'),
      cache = require('./blo/cache'),
      conf = require(dir + '/config'),
      articles = [];
  
  return connect.router(function(app){
    
    // Conf
    cache.config(conf);
    Article.config(conf);
    
    /* Routes */
    function routes() {
      
      // Home
      app.get('/', function(req, res, next){
        
        var context = {
          blogName: conf.blogName,
          articles: articles.sort(function(a, b){
            return b.metas.date - a.metas.date;
          }).slice(0, 10)
        };
        
        template.render("home", context, conf.skinDir, function(err, body) {
          if (err) throw err;
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(body);
        });
      });
      
      // Article
      app.get('/:title', function(req, res, next){
        
        function showArticle(article) {
          article.getContent(function(err, content) {
            if (err) throw err;
            var context = {
              blogName: conf.blogName,
              article: {
                metas: article.metas,
                content: content,
              }
            };
            template.render("article", context, conf.skinDir, function(err, body) {
              if (err) throw err;
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(body);
            });
          });
        }
        
        for (var i = 0; i < articles.length; i++) {
          console.log(articles[i].permalink, req.params.title);
          if (articles[i].permalink === req.params.title) {
            return showArticle(articles[i]);
          }
        }
        return next();
      });
    }
    
    // Load articles metas
    Article.getPermalinks(function(err, permalinks){
      function articleLoaded(err, article){
        article.getMetas(function(err, metas){
          article.metas = metas;
          articles.push(article);
          if (articles.length === permalinks.length) {
            routes();
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
