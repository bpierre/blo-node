# blo

blo is a simple blogging system: no database required, just plain old HTML files.

## Install

Install it via npm:

    npm install connect blo

Or clone this repository.

blo works as a connect middleware.
It takes one parameter, which is your blog directory.

Install it with:
    $ npm install blo

Create a demo blog:
    $ node node_modules/blo/bin/blo skel
    $ npm install .

Here is my app.js file:

    var connect = require('connect'),
        blo     = require('blo');
    
    var server = connect(
      connect.favicon(__dirname + '/public/favicon.ico'),
      connect.logger(),
      connect.static(__dirname + '/public'),
      blo(__dirname)
    ).listen(3000);

You need to create two directories and one file:

### articles/

The articles directory contain the articles, which just need to end with `.html`.

Article can be valid HTML files with doctype, or just an HTML fragment.

Be sure to fill somewhere the date, and the title of your articles. Choose the format you want, really.

Examples:

#### Valid HTML5 file

    <!doctype html>
    <meta charset="utf-8">
    <title>My article</title>
    <h1>My article</h1>
    <time>2011-04-11</time>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.</p>

#### HTML fragment

    <h1>My article</h1>
    <time>Wednesday 4th May 2011</time>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.</p>

### skin/

The skin directory contain the templates.
Templates are based on [dust](http://akdubya.github.com/dustjs/).

Two templates: home.html and article.html.

Examples:

#### home.html

    <!doctype html>
    <html>
    	<head>
    		<meta charset="utf-8" />
    		<title>{blogName}</title>
    	</head>
    	<body>
    		<header role="banner">
    			<h1><a href="/">{blogName}</a></h1>
    		</header>
    		<section>
    			<h1>Articles</h1>
    			<ul>{#articles}
    				<li><a href="/{permalink}">{metas.title}</a></li>{/articles}
    			</ul>
    		</section>
    	</body>
    </html>

#### article.html

    <!doctype html>
    <html>
    	<head>
    		<meta charset="utf-8" />
    		<title>{article.metas.title} | {blogName}</title>
    	</head>
    	<body>
    		<header role="banner">
    			<h1><a href="/">{blogName}</a></h1>
    		</header>
    		<section id="article">
    			<h1>{article.metas.title}</h1>
    			{article.content|s}
    		</section>
    	</body>
    </html>

### config.js

This file contains the configuration file of your project.

It should be a valid Node module which exports a configuration object.

Example:

    module.exports = {
      
      articlesDir: __dirname + '/articles', // Articles directory
      
      skinDir: __dirname + '/skin', // Skin (templates) directory
      
      blogName: "My blog", // Blog name
      
      lang: "FR-fr", // Language
      
      /* Do what you want with window here, but call `callback`
       * with an object containing `title` (String) and `date` (Date) keys.
       * You can add other keys, they will be available in your templates.
      */
      readMetas: function(window, callback) {
        
        var dateText = window.document.getElementsByTagName("time")[0].textContent,
            dateSplit = dateText.split("-");
        
        callback(null, {
          title: window.document.getElementsByTagName("title")[0].textContent,
          date: new Date(dateSplit[0]-0, dateSplit[1]-1, dateSplit[2]-0)
        });
      },
      
      /* Again, do what you want, but call `callback` with a string
       * containing your article. In this example, I remove tags I don’t want.
      */
      readArticle: function(window, callback) {
        var eltsToRemove = ["title", "h1", "time", "meta"],
            i = eltsToRemove.length;
        
        while (i--) {
          var elt = window.document.getElementsByTagName(eltsToRemove[i])[0];
          elt.parentNode.removeChild(elt);
        }
        
        callback(null, window.document.body.innerHTML);
      }
    };

