window.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#bookForm");
  const tableBody = document.querySelector("#bookTableBody");
  const message = document.querySelector("#bookMessage");
  const jsonOutput = document.querySelector("#jsonOutput");
  const downloadButton = document.querySelector("#downloadJson");
  const submitButton = form.querySelector('button[type="submit"]');

  let books = [];
  let editingId = null;

  const storedBooks = localStorage.getItem("bookNookBooks");

  if (storedBooks) {
    books = JSON.parse(storedBooks);
  }

  function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    return cell;
  }

  function saveBooks() {
    localStorage.setItem("bookNookBooks", JSON.stringify(books));
    displayBooks();
  }

  function displayBooks(searchText = "") {
    tableBody.innerHTML = "";

    const searchValue = searchText.toLowerCase();

    const filteredBooks = books.filter(function (book) {
      return (
        book.title.toLowerCase().includes(searchValue) ||
        book.author.toLowerCase().includes(searchValue) ||
        book.category.toLowerCase().includes(searchValue)
      );
    });

    if (filteredBooks.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");

      cell.colSpan = 8;
      cell.textContent = "No books found.";
      cell.className = "text-center";

      row.appendChild(cell);
      tableBody.appendChild(row);
    } else {
      filteredBooks.forEach(function (book) {
        const row = document.createElement("tr");

        row.appendChild(createCell(book.id));
        row.appendChild(createCell(book.title));
        row.appendChild(createCell(book.description));
        row.appendChild(createCell(book.author || "Not provided"));
        row.appendChild(createCell(book.category));
        row.appendChild(createCell(book.format));
        row.appendChild(createCell("$" + Number(book.price).toFixed(2)));

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "btn btn-warning btn-sm me-2";
        editButton.dataset.id = book.id;
        editButton.dataset.action = "edit";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.dataset.id = book.id;
        deleteButton.dataset.action = "delete";

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
      });
    }

    jsonOutput.textContent = JSON.stringify(books, null, 2);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.querySelector("#title").value.trim();
    const description = document.querySelector("#description").value.trim();
    const author = document.querySelector("#author").value.trim();
    const category = document.querySelector("#category").value.trim();
    const format = document.querySelector("#format").value;
    const price = document.querySelector("#price").value;

    if (
      title === "" ||
      description === "" ||
      category === "" ||
      format === "" ||
      price === ""
    ) {
      message.textContent = "Please fill out all required book fields.";
      message.className = "alert alert-danger mt-3";
      return;
    }

    if (Number(price) < 0) {
      message.textContent = "Please enter a valid price.";
      message.className = "alert alert-danger mt-3";
      return;
    }

    const bookData = {
      id: editingId || "BOOK" + Date.now(),
      title: title,
      description: description,
      author: author,
      category: category,
      format: format,
      unitOfMeasure: "Book",
      price: Number(price)
    };

    if (editingId === null) {
      books.push(bookData);
      message.textContent = "Book added successfully!";
    } else {
      const bookIndex = books.findIndex(function (book) {
        return book.id === editingId;
      });

      books[bookIndex] = bookData;
      editingId = null;
      submitButton.textContent = "Add Book";
      message.textContent = "Book updated successfully!";
    }

    message.className = "alert alert-success mt-3";
    form.reset();
    saveBooks();
  });

  tableBody.addEventListener("click", function (event) {
    const action = event.target.dataset.action;
    const bookId = event.target.dataset.id;

    if (action === "edit") {
      const book = books.find(function (item) {
        return item.id === bookId;
      });

      document.querySelector("#title").value = book.title;
      document.querySelector("#description").value = book.description;
      document.querySelector("#author").value = book.author;
      document.querySelector("#category").value = book.category;
      document.querySelector("#format").value = book.format;
      document.querySelector("#price").value = book.price;

      editingId = book.id;
      submitButton.textContent = "Update Book";

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

    if (action === "delete") {
      books = books.filter(function (book) {
        return book.id !== bookId;
      });

      message.textContent = "Book deleted successfully.";
      message.className = "alert alert-success mt-3";
      saveBooks();
    }
  });

const searchInput = document.querySelector("#bookSearch");

if (window.jQuery) {
  $("#bookSearch").on("input", function () {
    displayBooks($(this).val());
  });
} else {
  searchInput.addEventListener("input", function () {
    displayBooks(searchInput.value);
  });
}
  downloadButton.addEventListener("click", function () {
    const jsonData = JSON.stringify(books, null, 2);
    const file = new Blob([jsonData], {
      type: "application/json"
    });

    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = fileUrl;
    link.download = "book-nook-books.json";
    link.click();

    URL.revokeObjectURL(fileUrl);
  });

  displayBooks();
});
