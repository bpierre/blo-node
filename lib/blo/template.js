var fs = require("fs"),
    dust = require('dust'),
    compiledTpls = {};

// Disable whitespace compression
dust.optimizers.format = function(ctx, node) { return node; };

function compileTemplate(name, dir, callback) {
  fs.readFile(dir + '/' + name +'.html', 'utf8', function (err, data) {
    if (err) {
      throw err;
    }
    
    var compiled = dust.compile(data, name);
    dust.loadSource(compiled);
    
    return callback(compiled);
  });
}

function renderCached(name, context, callback) {
  dust.render(name, context, function(err, out) {
    return callback(err, out);
  });
}

function render(name, context, dir, callback) {
  if (!compiledTpls[name]) {
    compileTemplate(name, dir, function(dustTpl){
      compiledTpls[name] = dustTpl;
      renderCached(name, context, callback);
    });
  } else {
    renderCached(name, context, callback);
  }
}

module.exports = {
  render: render
};