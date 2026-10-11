window.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector("#signupForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();

      let name = document.querySelector("#fullName").value;
      let email = document.querySelector("#email").value;
      let age = document.querySelector("#age").value;
      let address = document.querySelector("#address").value;

      let message = document.querySelector("#formMessage");

      if (name === "" || email === "" || age === "" || address === "") {
        message.innerHTML = "Please fill out all required fields.";
      } else if (!email.includes("@") || !email.includes(".")) {
        message.innerHTML = "Please enter a valid email address.";
      } else if (Number(age) < 1) {
        message.innerHTML = "Please enter a valid age.";
      } else {
        message.innerHTML = "Registration successful!";
      }
    });
});
