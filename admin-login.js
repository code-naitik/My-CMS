const form = document.querySelector("#admin-login-form");

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    if (username === "" || password === "") {
        alert("Please fill all fields");
        return;
    }

    try {

        const response = await fetch("http://127.0.0.1:3000/login", {
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

            alert(data.message);

        }

    } catch (error) {

        console.log(error);
        alert("Server connection failed");

    }

});