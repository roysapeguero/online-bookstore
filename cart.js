(function () {
  "use strict";

  const CART_KEY = "bookNookCart";
  let cart = [];

  function readCart() {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem(CART_KEY) || "[]"
      );

      if (!Array.isArray(savedCart)) {
        return [];
      }

      return savedCart.map(function (item) {
        return {
          id: String(item.id),
          title: String(item.title),
          description: item.description || item.title,
          category: item.category || "Book",
          unitOfMeasure:
            item.unitOfMeasure || item.format || "Book",
          price: Number(item.price),
          quantity: Number(item.quantity) || 1
        };
      });
    } catch (error) {
      return [];
    }
  }

  function createJsonDocument() {
    return cart.map(function (item) {
      return {
        productId: item.id,
        description: item.description,
        category: item.category,
        unitOfMeasure: item.unitOfMeasure,
        price: item.price,
        quantity: item.quantity
      };
    });
  }

  function updateJsonOutput() {
    const productDocument = createJsonDocument();

    $("#jsonOutput").text(
      JSON.stringify(productDocument, null, 2)
    );
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
    updateJsonOutput();
  }

  function money(amount) {
    return "$" + Number(amount).toFixed(2);
  }

  function showMessage(text, isError) {
    const message = $("#cartMessage");

    message.text(text);

    if (isError) {
      message.attr("class", "alert alert-danger mt-3");
    } else {
      message.attr("class", "alert alert-success mt-3");
    }
  }

  function addToCart(book) {
    if (
      !book ||
      book.id == null ||
      !String(book.title || "").trim() ||
      !String(book.description || "").trim() ||
      !String(book.category || "").trim() ||
      !String(book.format || "").trim() ||
      !Number.isFinite(Number(book.price)) ||
      Number(book.price) < 0
    ) {
      showMessage(
        "This book has incomplete or invalid product information.",
        true
      );

      return false;
    }

    const id = String(book.id);

    const existingBook = cart.find(function (item) {
      return item.id === id;
    });

    if (existingBook) {
      existingBook.quantity += 1;
    } else {
      cart.push({
        id: id,
        title: String(book.title),
        description: String(book.description),
        category: String(book.category),
        unitOfMeasure: String(book.format),
        price: Number(book.price),
        quantity: 1
      });
    }

    saveCart();
    showMessage(book.title + " was added to your cart.", false);

    return true;
  }

  function changeQuantity(id, amount) {
    const item = cart.find(function (book) {
      return book.id === id;
    });

    if (!item) {
      return;
    }

    const newQuantity = item.quantity + amount;

    if (newQuantity < 1) {
      showMessage(
        "Quantity cannot be less than one. Use Remove to delete the book.",
        true
      );

      return;
    }

    item.quantity = newQuantity;
    saveCart();

    showMessage("Book quantity was updated.", false);
  }

  function removeFromCart(id) {
    cart = cart.filter(function (book) {
      return book.id !== id;
    });

    saveCart();
    showMessage("Book removed from your cart.", false);
  }

  function renderCart() {
    const container = document.getElementById("cartItems");
    const subtotalElement =
      document.getElementById("cartSubtotal");
    const totalElement = document.getElementById("cartTotal");

    if (!container) {
      return;
    }

    container.replaceChildren();

    if (cart.length === 0) {
      const emptyMessage = document.createElement("p");

      emptyMessage.className = "alert alert-info";
      emptyMessage.textContent =
        "Your shopping cart is empty. Search for a book to get started!";

      container.appendChild(emptyMessage);
    }

    cart.forEach(function (book) {
      const item = document.createElement("div");
      item.className = "card mb-3 p-3";

      const title = document.createElement("h3");
      title.className = "h5";
      title.textContent = book.title;

      const details = document.createElement("p");
      details.textContent =
        book.category + " | " + book.unitOfMeasure;

      const price = document.createElement("p");
      price.textContent =
        money(book.price) +
        " each | Item total: " +
        money(book.price * book.quantity);

      const controls = document.createElement("div");
      controls.className =
        "d-flex align-items-center gap-2 flex-wrap";

      const decreaseButton = document.createElement("button");
      decreaseButton.type = "button";
      decreaseButton.textContent = "Decrease";
      decreaseButton.className =
        "btn btn-outline-secondary btn-sm";
      decreaseButton.dataset.action = "decrease";
      decreaseButton.dataset.id = book.id;

      const quantity = document.createElement("span");
      quantity.textContent = "Quantity: " + book.quantity;

      const increaseButton = document.createElement("button");
      increaseButton.type = "button";
      increaseButton.textContent = "Increase";
      increaseButton.className =
        "btn btn-outline-secondary btn-sm";
      increaseButton.dataset.action = "increase";
      increaseButton.dataset.id = book.id;

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.textContent = "Remove";
      removeButton.className = "btn btn-danger btn-sm";
      removeButton.dataset.action = "remove";
      removeButton.dataset.id = book.id;

      controls.append(
        decreaseButton,
        quantity,
        increaseButton,
        removeButton
      );

      item.append(title, details, price, controls);
      container.appendChild(item);
    });

    const subtotal = cart.reduce(function (total, book) {
      return total + book.price * book.quantity;
    }, 0);

    if (subtotalElement) {
      subtotalElement.textContent = money(subtotal);
    }

    if (totalElement) {
      totalElement.textContent = money(subtotal);
    }
  }

  function searchBooks(searchText) {
    let savedBooks = [];

    try {
      savedBooks = JSON.parse(
        localStorage.getItem("bookNookBooks") || "[]"
      );
    } catch (error) {
      savedBooks = [];
    }

    const searchValue = searchText.toLowerCase().trim();

    return $.grep(savedBooks, function (book) {
      const title = String(book.title || "").toLowerCase();
      const author = String(book.author || "").toLowerCase();
      const category = String(
        book.category || ""
      ).toLowerCase();

      return (
        title.includes(searchValue) ||
        author.includes(searchValue) ||
        category.includes(searchValue)
      );
    });
  }

  function displaySearchResults(books) {
    const resultsContainer = $("#searchResults");
    const searchMessage = $("#searchMessage");

    resultsContainer.empty();

    if (books.length === 0) {
      searchMessage
        .text("No books matched your search.")
        .attr("class", "alert alert-danger mt-3");

      return;
    }

    searchMessage
      .text(books.length + " book result(s) found.")
      .attr("class", "alert alert-success mt-3");

    $.each(books, function (index, book) {
      const card = $("<div>").addClass("col-md-6");

      const content = $("<div>").addClass(
        "card bg-dark text-light border-secondary p-3 h-100"
      );

      const title = $("<h3>")
        .addClass("h5")
        .text(book.title);

      const author = $("<p>").text(
        book.author || "Unknown author"
      );

      const category = $("<p>").text(
        "Category: " + book.category
      );

      const price = $("<p>").text(
        "$" + Number(book.price).toFixed(2)
      );

      const button = $("<button>")
        .attr("type", "button")
        .addClass("btn btn-light")
        .text("Add to Cart");

      button.on("click", function () {
        addToCart(book);
      });

      content.append(
        title,
        author,
        category,
        price,
        button
      );

      card.append(content);
      resultsContainer.append(card);
    });
  }

  function sendCartToApi() {
    const apiMessage = $("#apiMessage");

    if (cart.length === 0) {
      apiMessage
        .text("Add at least one book before preparing the order.")
        .attr("class", "alert alert-danger mt-3");

      return;
    }

    const productDocument = createJsonDocument();
    const jsonData = JSON.stringify(productDocument);

    updateJsonOutput();

    $.ajax({
      url: "/api/cart",
      type: "POST",
      contentType: "application/json",
      data: jsonData,

      success: function () {
        apiMessage
          .text("Shopping cart data was sent successfully.")
          .attr("class", "alert alert-success mt-3");
      },

      error: function () {
        apiMessage
          .text(
            "JSON order data is prepared. The RESTful API will be connected in a future assignment."
          )
          .attr("class", "alert alert-success mt-3");
      }
    });
  }

  $(function () {
    cart = readCart();

    $("#bookSearchForm").on("submit", function (event) {
      event.preventDefault();

      const searchText = $("#bookSearchInput").val().trim();

      if (searchText === "") {
        $("#searchMessage")
          .text("Enter a title, author, or category.")
          .attr("class", "alert alert-danger mt-3");

        return;
      }

      const results = searchBooks(searchText);
      displaySearchResults(results);
    });

    $("#cartItems").on(
      "click",
      "button[data-action]",
      function () {
        const id = String($(this).data("id"));
        const action = $(this).data("action");

        if (action === "increase") {
          changeQuantity(id, 1);
        }

        if (action === "decrease") {
          changeQuantity(id, -1);
        }

        if (action === "remove") {
          removeFromCart(id);
        }
      }
    );

    $("#sendCartButton").on("click", sendCartToApi);

    renderCart();
    updateJsonOutput();
  });

  window.BookNookCart = {
    addToCart: addToCart,

    getCart: function () {
      return cart.map(function (item) {
        return Object.assign({}, item);
      });
    }
  };
})();
