const username = localStorage.getItem("username");

if (!username) {
    window.location.href = "admin-login.html";
} else {
    document.querySelector("#username").textContent = username;
}

document.querySelector("#logout-link").addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("username");
    window.location.href = "home.html";
});
