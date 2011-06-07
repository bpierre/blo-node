var connect = require('connect'),
    blo = require('blo'),
    dust = require('dust'),
    fs = require('fs'),
    conf = require('./config');

function error404() {
  var compiled = false,
      context = { blogName: conf.blogName };
  function compile(name, callback) {
    fs.readFile(__dirname + '/skin/' + name + '.html', 'utf8', function (err, data) {
      if (err) throw err;
      var compiled = dust.compile(data, name);
      dust.loadSource(compiled);
      return callback(compiled);
    });
  }
  function render(name, res) {
    dust.render(name, context, function(err, out) {
      res.writeHead('404', {'Content-Type': 'text/html'});
      res.end(out);
    });
  }
  
  return function(req, res, next) {
    if (!compiled) {
      compile('base', function(compiled) {
        compile('404', function(compiled) {
          compiled = true;
          render('404', res);
        });
      });
    } else {
      render('404', res);
    }
  };
}

connect(
  connect.favicon(__dirname + '/public/favicon.ico'),
  connect.logger(),
  connect.static(__dirname + '/public'),
  blo(conf),  // Blo
  error404()  // 404
).listen(3000);