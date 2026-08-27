const username = localStorage.getItem("username");

if (!username) {
    window.location.href = "admin-login.html";
}

const form = document.querySelector("#blog-form");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Publishing...";

    try {
        const response = await fetch("http://127.0.0.1:3000/blogs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: document.querySelector("#title").value,
                content: document.querySelector("#content").value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to publish blog post");
        }

        alert(data.message);
        window.location.href = `blog-post.html?id=${data.id}`;
    } catch (error) {
        alert(error.message || "Server connection failed");
        button.disabled = false;
        button.textContent = "Publish Blog";
    }
});
