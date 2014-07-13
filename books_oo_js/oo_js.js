var libros = {

  init: function() {
    // Instantiating a new object
    var book = new Book({
      title: "Robot Dreams",
      author: "Isaac Asimov",
      numPages: '320'
    });

    // Instantiating a new object
    var paperbackbook = new Paperback({
      title: "Jaws",
      author: "Peter Benchley",
      numPages: 99
    });

    book.read();
    paperbackbook.read();
  }

  function Book(config) {
    config = config || {};
    this.title = config.title || "Untitled";
    this.author = config.author || "Unknown";
    this.numPages = config.numPages || 100;
    this.currentPage = 0;
  }

  // The constructor function
  function Paperback(title, author, numPages, cover) {
    Book.call(this, title, author, numPages);
    this.cover = cover;
  }

  // A method on the object
  Book.prototype.read = function() {
    console.log();
    $("body").append("<p>You read " + this.numPages + " pages of the title " + this.title + "!</p>");
  };

  // Extending the Book object
  Paperback.prototype = Object.create(Book.prototype);

  libros.init();

}