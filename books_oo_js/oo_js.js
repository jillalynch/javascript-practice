var libros = {
  
  init: function() {
    this.book.read();
    this.paperbackbook.read();
  },
  
  Book: function(config) {
    config = config || {};
    this.title = config.title || "Untitled";
    this.author = config.author || "Unknown";
    this.numPages = config.numPages || 100;
    this.currentPage = 0;
  },

  // The constructor function
  Paperback: function(title, author, numPages, cover) {
    Book.call(this, title, author, numPages);
    this.cover = cover;
  },

  // A method on the object
  //Book.prototype.read = function() {
    //console.log();
    //$("body").append("<p>You read " + this.numPages + " pages of the title " + this.title + "!</p>");
  //},

  // Extending the Book object
  //Paperback.prototype = Object.create(Book.prototype);
  
      // Instantiating a new object
    book: new Book({
      title: "Robot Dreams",
      author: "Isaac Asimov",
      numPages: '320'
    }),

    // Instantiating a new object
    paperbackbook: new Paperback({
      title: "Jaws",
      author: "Peter Benchley",
      numPages: 99
    }),

};

libros.init();
