const form = document.querySelector("#contact-form");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector("button[type='submit']");
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Sending...";

    try {
        const response = await fetch("http://127.0.0.1:3000/contact-messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: document.querySelector("#name").value,
                email: document.querySelector("#email").value,
                subject: document.querySelector("#subject").value,
                message: document.querySelector("#message").value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to send message");
        }

        form.reset();
        alert(data.message);
    } catch (error) {
        alert(error.message || "Server connection failed");
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
});
