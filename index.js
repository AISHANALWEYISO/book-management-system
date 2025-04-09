let books = JSON.parse(localStorage.getItem("books")) || [];

// Render books
function renderBooks(filter = "all", searchTerm = "") {
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = "";

  const filteredBooks = books.filter(book => {
    const matchesTab = 
      filter === "all" ||
      (filter === "favorites" && book.favorite) ||
      (filter === "unread" && book.status === "Unread") ||
      (filter === "read" && book.status === "Read");

    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  filteredBooks.forEach(book => {
    const card = `
      <div class="col-md-4 book-card">
        <img src="${book.image}" alt="${book.title}">
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Genre:</strong> ${book.genre}</p>
        <p><strong>Status:</strong> ${book.status}</p>
        <button class="btn btn-warning edit-btn" data-id="${book.id}">Edit</button>
        <button class="btn btn-danger delete-btn" data-id="${book.id}">Delete</button>
        <button class="btn btn-info favorite-btn" data-id="${book.id}">
          ${book.favorite ? "Remove Favorite" : "Mark Favorite"}
        </button>
      </div>
    `;
    bookList.innerHTML += card;
  });

  // Attach event listeners
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteBook(btn.dataset.id));
  });

  document.querySelectorAll(".favorite-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleFavorite(btn.dataset.id));
  });
}

// Save books to localStorage
function saveBooks() {
  localStorage.setItem("books", JSON.stringify(books));
}

// Add a book
document.getElementById("addBookForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const genre = document.getElementById("genre").value;
  const status = document.getElementById("status").value;
  const imageFile = document.getElementById("image").files[0];

  const base64Image = await convertToBase64(imageFile);

  const newBook = {
    id: Date.now().toString(),
    title,
    author,
    genre,
    status,
    favorite: false,
    image: base64Image,
  };

  books.push(newBook);
  saveBooks();
  renderBooks();
  document.getElementById("addBookForm").reset();
  bootstrap.Modal.getInstance(document.getElementById("addBookModal")).hide();
});

// Convert file to Base64
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// Open edit modal
function openEditModal(id) {
  const book = books.find(b => b.id === id);
  document.getElementById("editId").value = book.id;
  document.getElementById("editTitle").value = book.title;
  document.getElementById("editAuthor").value = book.author;
  document.getElementById("editGenre").value = book.genre;
  document.getElementById("editStatus").value = book.status;

  const modal = new bootstrap.Modal(document.getElementById("editBookModal"));
  modal.show();
}

// Edit a book
document.getElementById("editBookForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const title = document.getElementById("editTitle").value;
  const author = document.getElementById("editAuthor").value;
  const genre = document.getElementById("editGenre").value;
  const status = document.getElementById("editStatus").value;
  const imageFile = document.getElementById("editImage").files[0];

  const bookIndex = books.findIndex(b => b.id === id);
  if (imageFile) {
    books[bookIndex].image = await convertToBase64(imageFile);
  }

  books[bookIndex].title = title;
  books[bookIndex].author = author;
  books[bookIndex].genre = genre;
  books[bookIndex].status = status;

  saveBooks();
  renderBooks();
  document.getElementById("editBookForm").reset();
  bootstrap.Modal.getInstance(document.getElementById("editBookModal")).hide();
});

// Delete a book
function deleteBook(id) {
  if (confirm("Are you sure you want to delete this book?")) {
    books = books.filter(book => book.id !== id);
    saveBooks();
    renderBooks();
  }
}

// Toggle favorite
function toggleFavorite(id) {
  const book = books.find(b => b.id === id);
  book.favorite = !book.favorite;
  saveBooks();
  renderBooks();
}

// Handle tab clicks
document.getElementById("bookTabs").addEventListener("click", (e) => {
  if (e.target.dataset.tab) {
    document.querySelectorAll("#bookTabs .nav-link").forEach(tab => tab.classList.remove("active"));
    e.target.classList.add("active");
    renderBooks(e.target.dataset.tab, document.getElementById("searchInput").value);
  }
});

// Handle search input
document.getElementById("searchInput").addEventListener("input", (e) => {
  const activeTab = document.querySelector("#bookTabs .nav-link.active").dataset.tab;
  renderBooks(activeTab, e.target.value);
});

// Initial render
renderBooks();