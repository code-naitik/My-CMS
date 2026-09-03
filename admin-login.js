const form = document.querySelector("#admin-login-form");

if (form) {
    form.addEventListener("submit", async function(event) {

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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.message === "Login successful") {

                localStorage.setItem("username", username);

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