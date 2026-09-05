window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        const usernameField = document.querySelector("#username");
        const passwordField = document.querySelector("#password");
        if (usernameField) usernameField.value = "";
        if (passwordField) passwordField.value = "";
    }
});

const loginForm = document.querySelector("#admin-login-form");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const username = document.querySelector("#username").value;
        const password = document.querySelector("#password").value;

        if (username === "" || password === "") {
            showToast("Please fill all fields", "error");
            return;
        }

        try {

            const response = await fetch("/login", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {

                window.location.href = "dashboard.html";

            } else {

                showToast(data.message, "error");

            }

        } catch (error) {

            console.log(error);
            showToast("Server connection failed", "error");

        }

    });
}