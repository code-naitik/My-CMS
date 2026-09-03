const notes = document.querySelector("#notes");
const topicId = new URLSearchParams(window.location.search).get("id");

async function loadTopic() {
    if (!topicId) {
        notes.innerHTML = "<h1>Topic not found</h1><p>Please return to the blog list and choose a topic.</p>";
        return;
    }

    try {
        const response = await fetch(`/topics/${topicId}`);
        const topic = await response.json();

        if (!response.ok) throw new Error(topic.message || "Topic not found");

        document.title = `${topic.title} | Naitik`;

        const title = document.createElement("h1");
        title.textContent = topic.title;

        const content = document.createElement("p");
        content.style.whiteSpace = "pre-wrap";
        content.textContent = topic.content;

        notes.replaceChildren(title, content);
    } catch (error) {
        notes.innerHTML = `<h1>Topic not found</h1><p>${error.message}</p>`;
    }
}

loadTopic();