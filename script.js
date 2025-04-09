function getBooks() {
  return JSON.parse(localStorage.getItem("books")) || [];
}

function saveBooks(books) {
  localStorage.setItem("books", JSON.stringify(books));
}

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function renderBooks(filterTab = "all", search = "") {
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";
  const books = getBooks();

  const filtered = books.filter(book => {
    const matchSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
                        book.author.toLowerCase().includes(search.toLowerCase());
    const matchTab =
      filterTab === "all" ||
      (filterTab === "favorites" && book.favorite) ||
      (filterTab === "read" && book.status === "Read") ||
      (filterTab === "unread" && book.status === "Unread");
    return matchSearch && matchTab;
  });

  filtered.forEach(book => {
    const col = document.createElement("div");
    col.className = "col-md-4";
    col.innerHTML = `
      <div class="card">
        <img src="${book.image}" class="card-img-top book-img">
        <div class="card-body">
          <h5 class="card-title">${book.title}</h5>
          <p class="card-text"><strong>Author:</strong> ${book.author}<br><strong>Genre:</strong> ${book.genre}<br><strong>Status:</strong> ${book.status}</p>
          <div class="card-buttons">
            <button onclick="toggleFavorite('${book.id}')" class="favorite-btn">${book.favorite ? "❤️" : "🤍"}</button>
            <div>
              <button class="btn btn-sm btn-info" onclick="editBook('${book.id}')">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteBook('${book.id}')">Delete</button>
            </div>
          </div>
        </div>
      </div>`;
    bookList.appendChild(col);
  });
}

document.getElementById("addBookForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = e.target;
  const title = form.title.value.trim();
  const author = form.author.value.trim();
  const genre = form.genre.value.trim();
  const status = form.status.value;
  const image = form.image.files[0];
  if (!image) return alert("Please upload an image");

  const reader = new FileReader();
  reader.onload = function () {
    const newBook = {
      id: generateId(),
      title,
      author,
      genre,
      status,
      image: reader.result,
      favorite: false
    };
    const books = getBooks();
    books.push(newBook);
    saveBooks(books);
    renderBooks();
    form.reset();
    bootstrap.Modal.getInstance(document.getElementById("addBookModal")).hide();
  };
  reader.readAsDataURL(image);
});

function deleteBook(id) {
  if (confirm("Delete this book?")) {
    const books = getBooks().filter(b => b.id !== id);
    saveBooks(books);
    renderBooks();
  }
}

function toggleFavorite(id) {
  const books = getBooks();
  const book = books.find(b => b.id === id);
  if (book) {
    book.favorite = !book.favorite;
    saveBooks(books);
    const tab = document.querySelector("#bookTabs .active").dataset.tab;
    const search = document.getElementById("searchInput").value;
    renderBooks(tab, search);
  }
}

document.querySelectorAll("#bookTabs a").forEach(tab => {
  tab.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelectorAll("#bookTabs a").forEach(t => t.classList.remove("active"));
    this.classList.add("active");
    renderBooks(this.dataset.tab, document.getElementById("searchInput").value);
  });
});

document.getElementById("searchInput").addEventListener("input", function () {
  const tab = document.querySelector("#bookTabs .active").dataset.tab;
  renderBooks(tab, this.value);
});

function editBook(id) {
  const book = getBooks().find(b => b.id === id);
  if (!book) return;

  document.getElementById("editId").value = book.id;
  document.getElementById("editTitle").value = book.title;
  document.getElementById("editAuthor").value = book.author;
  document.getElementById("editGenre").value = book.genre;
  document.getElementById("editStatus").value = book.status;
  document.getElementById("editImage").value = "";

  new bootstrap.Modal(document.getElementById("editBookModal")).show();
}

document.getElementById("editBookForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const id = document.getElementById("editId").value;
  const title = document.getElementById("editTitle").value;
  const author = document.getElementById("editAuthor").value;
  const genre = document.getElementById("editGenre").value;
  const status = document.getElementById("editStatus").value;
  const imageFile = document.getElementById("editImage").files[0];

  const books = getBooks();
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return;

  books[index].title = title;
  books[index].author = author;
  books[index].genre = genre;
  books[index].status = status;

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function () {
      books[index].image = reader.result;
      saveBooks(books);
      renderBooks();
      bootstrap.Modal.getInstance(document.getElementById("editBookModal")).hide();
    };
    reader.readAsDataURL(imageFile);
  } else {
    saveBooks(books);
    renderBooks();
    bootstrap.Modal.getInstance(document.getElementById("editBookModal")).hide();
  }
});

renderBooks();
