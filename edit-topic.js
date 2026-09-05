requireLogin();

const topicId = new URLSearchParams(window.location.search).get("id");
const form = document.querySelector("#topic-form");
const titleInput = document.querySelector("#title");
const contentInput = document.querySelector("#content");

async function loadTopic() {
    try {
        const response = await fetch(`/topics/${topicId}`);
        const topic = await response.json();

        if (!response.ok) throw new Error(topic.message || "Could not load this topic.");

        titleInput.value = topic.title;
        contentInput.value = topic.content;
    } catch (error) {
        alert(error.message);
        window.location.href = "blogs.html";
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Saving...";

    try {
        const response = await fetch(`/topics/${topicId}`, {
            method: "PUT",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: titleInput.value,
                content: contentInput.value
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to update topic");

        alert(data.message);
        window.location.href = `blog-notes.html?id=${topicId}`;
    } catch (error) {
        alert(error.message);
        button.disabled = false;
        button.textContent = "Save Changes";
    }
});

loadTopic();