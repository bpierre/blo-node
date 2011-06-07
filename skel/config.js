module.exports = {
  
  // Blog name
  blogName: 'My Blog',
  
  // Lang
  lang: 'en-US',
  
  // Articles directory
  articlesDir: __dirname + '/articles',
  
  // Skin (templates) directory
  skinDir: __dirname + '/skin',
  
  // Cache directory
  cacheDir: __dirname + '/cache',
  
  // Do what you want with window here, but call `callback`
  // with an object containing `title` (String) and `date` (Date) keys.
  // You can add other keys, they will be available in your templates.
  readMetas: function(window, callback) {
    var dateText = window.document.getElementsByTagName('time')[0].textContent,
        dateSplit = dateText.split('-');
    
    callback(null, {
      title: window.document.getElementsByTagName('title')[0].textContent,
      date: new Date(dateSplit[0]-0, dateSplit[1]-1, dateSplit[2]-0)
    });
  },
  
  // Again, do what you want, but call `callback` with a string
  // containing your article. In this example, I remove tags I don’t want.
  readArticle: function(window, callback, metas) {
    var eltsToRemove = ['title', 'h1', 'meta'],
        i = eltsToRemove.length,
        doc = window.document,
        time = doc.getElementsByTagName('time')[0];
    
    while (i--) {
      var elt = doc.getElementsByTagName(eltsToRemove[i])[0];
      elt.parentNode.removeChild(elt);
    }
    
    time.setAttribute('pubdate', 'pubdate');
    time.setAttribute('datetime', metas.date.toISOString());
    
    callback(null, doc.body.innerHTML);
  }
};
