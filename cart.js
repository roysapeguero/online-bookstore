(function () {
  "use strict";

  const CART_KEY = "bookNookCart";
  let cart = [];

  function readCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(saved)
        ? saved
            .filter(
              (item) =>
                item &&
                item.id != null &&
                typeof item.title === "string" &&
                Number.isFinite(Number(item.price)) &&
                Number(item.price) >= 0 &&
                Number.isInteger(Number(item.quantity)) &&
                Number(item.quantity) > 0,
            )
            .map((item) => ({
              id: String(item.id),
              title: item.title,
              price: Number(item.price),
              quantity: Number(item.quantity),
            }))
        : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
  }

  function money(amount) {
    return "$" + amount.toFixed(2);
  }

  function showMessage(text, isError = false) {
    const message = document.getElementById("cartMessage");
    if (!message) return;
    message.textContent = text;
    message.className = isError
      ? "alert alert-danger mt-3"
      : "alert alert-success mt-3";
  }

  function addToCart(book) {
    if (
      !book ||
      book.id == null ||
      !String(book.title || "").trim() ||
      !Number.isFinite(Number(book.price)) ||
      Number(book.price) < 0 ||
      book.price === ""
    ) {
      showMessage("This book has invalid product information.", true);
      return false;
    }

    const id = String(book.id);
    const existing = cart.find((item) => item.id === id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id,
        title: String(book.title),
        price: Number(book.price),
        quantity: 1,
      });
    }

    saveCart();
    showMessage(book.title + " added to your cart!");
    return true;
  }

  function changeQuantity(id, amount) {
    const item = cart.find((book) => book.id === id);
    if (!item) return;

    const next = item.quantity + amount;

    if (next < 1) {
      showMessage(
        "Quantity cannot be less than one. Use Remove to delete a book.",
        true,
      );
      return;
    }

    item.quantity = next;
    saveCart();
  }

  function removeFromCart(id) {
    cart = cart.filter((book) => book.id !== id);
    saveCart();
    showMessage("Book removed from your cart.");
  }

  function renderCart() {
    const container = document.getElementById("cartItems");
    const subtotalElement = document.getElementById("cartSubtotal");
    const totalElement = document.getElementById("cartTotal");

    if (!container) return;

    container.replaceChildren();

    if (cart.length === 0) {
      const empty = document.createElement("p");
      empty.className = "alert alert-info";
      empty.textContent =
        "Your shopping cart is empty. Search for a book to get started!";
      container.appendChild(empty);
    }

    cart.forEach((book) => {
      const item = document.createElement("div");
      item.className = "card mb-3 p-3";

      const title = document.createElement("h3");
      title.className = "h5";
      title.textContent = book.title;

      const price = document.createElement("p");
      price.textContent =
        money(book.price) +
        " each · Item total: " +
        money(book.price * book.quantity);

      const controls = document.createElement("div");
      controls.className = "d-flex align-items-center gap-2 flex-wrap";

      function makeButton(label, action, className) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.className = className;
        button.dataset.action = action;
        button.dataset.id = book.id;
        return button;
      }

      const quantity = document.createElement("span");
      quantity.textContent = "Quantity: " + book.quantity;

      controls.append(
        makeButton("−", "decrease", "btn btn-outline-secondary btn-sm"),
        quantity,
        makeButton("+", "increase", "btn btn-outline-secondary btn-sm"),
        makeButton("Remove", "remove", "btn btn-danger btn-sm"),
      );

      item.append(title, price, controls);
      container.appendChild(item);
    });

    const subtotal = cart.reduce(
      (sum, book) => sum + book.price * book.quantity,
      0,
    );

    if (subtotalElement) subtotalElement.textContent = money(subtotal);
    if (totalElement) totalElement.textContent = money(subtotal);
  }

  document.addEventListener("DOMContentLoaded", function () {
    cart = readCart();

    const container = document.getElementById("cartItems");

    if (container) {
      container.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");
        if (!button || !container.contains(button)) return;

        const id = button.dataset.id;

        if (button.dataset.action === "increase") changeQuantity(id, 1);
        if (button.dataset.action === "decrease") changeQuantity(id, -1);
        if (button.dataset.action === "remove") removeFromCart(id);
      });
    }

    renderCart();
  });

  window.BookNookCart = {
    addToCart,
    getCart: () => cart.map((item) => ({ ...item })),
  };
})();
