const postContainer = document.querySelector("#post");
const postId = new URLSearchParams(window.location.search).get("id");

async function loadPost() {
    if (!postId) {
        postContainer.textContent = "Blog post not found.";
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:3000/blogs/${postId}`);
        const post = await response.json();

        if (!response.ok) {
            throw new Error(post.message || "Blog post not found.");
        }

        document.title = `${post.title} | Naitik`;
        const title = document.createElement("h1");
        title.textContent = post.title;
        const date = document.createElement("p");
        date.className = "message-sender";
        date.textContent = new Date(post.created_at).toLocaleDateString();
        const content = document.createElement("p");
        content.className = "message-body";
        content.textContent = post.content;
        postContainer.replaceChildren(title, date, content);
    } catch (error) {
        postContainer.textContent = error.message || "Could not load this blog post.";
    }
}

loadPost();
