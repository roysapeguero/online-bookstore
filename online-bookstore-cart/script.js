window.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#signupForm");
  const message = document.querySelector("#formMessage");
  const tableBody = document.querySelector("#memberTableBody");
  const jsonOutput = document.querySelector("#jsonOutput");
  const downloadButton = document.querySelector("#downloadJson");
  const submitButton = form.querySelector('button[type="submit"]');

  let users = [];
  let editingId = null;

  const storedUsers = localStorage.getItem("bookNookUsers");

  if (storedUsers) {
    users = JSON.parse(storedUsers);
  }

  function saveUsers() {
    localStorage.setItem("bookNookUsers", JSON.stringify(users));
    displayUsers();
  }

  function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    return cell;
  }

  function displayUsers() {
    tableBody.innerHTML = "";

    if (users.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");

      cell.colSpan = 6;
      cell.textContent = "No members have been registered yet.";
      cell.className = "text-center";

      row.appendChild(cell);
      tableBody.appendChild(row);
    } else {
      users.forEach(function (user) {
        const row = document.createElement("tr");

        row.appendChild(createCell(user.fullName));
        row.appendChild(createCell(user.email));
        row.appendChild(createCell(user.age));
        row.appendChild(createCell(user.address));
        row.appendChild(createCell(user.phone || "Not provided"));

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "btn btn-warning btn-sm me-2";
        editButton.dataset.id = user.id;
        editButton.dataset.action = "edit";

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.dataset.id = user.id;
        deleteButton.dataset.action = "delete";

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
      });
    }

    jsonOutput.textContent = JSON.stringify(users, null, 2);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const fullName = document.querySelector("#fullName").value.trim();
    const email = document.querySelector("#email").value.trim();
    const age = document.querySelector("#age").value;
    const address = document.querySelector("#address").value.trim();
    const phone = document.querySelector("#phone").value.trim();

    if (fullName === "" || email === "" || age === "" || address === "") {
      message.textContent = "Please fill out all required fields.";
      message.className = "alert alert-danger mt-3";
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      message.textContent = "Please enter a valid email address.";
      message.className = "alert alert-danger mt-3";
      return;
    }

    if (Number(age) < 1) {
      message.textContent = "Please enter a valid age.";
      message.className = "alert alert-danger mt-3";
      return;
    }

    const userData = {
      id: editingId || Date.now(),
      fullName: fullName,
      email: email,
      age: Number(age),
      address: address,
      phone: phone
    };

    if (editingId === null) {
      users.push(userData);
      message.textContent = "Registration successful!";
    } else {
      const userIndex = users.findIndex(function (user) {
        return user.id === editingId;
      });

      users[userIndex] = userData;
      editingId = null;
      submitButton.textContent = "Sign Up";
      message.textContent = "Member information updated!";
    }

    message.className = "alert alert-success mt-3";
    saveUsers();
    form.reset();
  });

  tableBody.addEventListener("click", function (event) {
    const action = event.target.dataset.action;
    const userId = Number(event.target.dataset.id);

    if (action === "edit") {
      const user = users.find(function (member) {
        return member.id === userId;
      });

      document.querySelector("#fullName").value = user.fullName;
      document.querySelector("#email").value = user.email;
      document.querySelector("#age").value = user.age;
      document.querySelector("#address").value = user.address;
      document.querySelector("#phone").value = user.phone;

      editingId = user.id;
      submitButton.textContent = "Update Member";

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

    if (action === "delete") {
      users = users.filter(function (user) {
        return user.id !== userId;
      });

      message.textContent = "Member deleted.";
      message.className = "alert alert-success mt-3";
      saveUsers();
    }
  });

  downloadButton.addEventListener("click", function () {
    const jsonData = JSON.stringify(users, null, 2);
    const file = new Blob([jsonData], { type: "application/json" });
    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = fileUrl;
    link.download = "book-nook-members.json";
    link.click();

    URL.revokeObjectURL(fileUrl);
  });

  displayUsers();
});
