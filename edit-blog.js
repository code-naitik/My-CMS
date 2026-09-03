const username = localStorage.getItem("username");
if (!username) window.location.href = "admin-login.html";

const postId = new URLSearchParams(window.location.search).get("id");
const form = document.querySelector("#blog-form");
const titleInput = document.querySelector("#title");

const quill = new Quill("#editor", {
    theme: "snow",
    modules: {
        toolbar: {
            container: [
                ["bold", "italic", "underline"],
                [{ color: [] }],
                ["link", "image"]
            ],
            handlers: {
                image: insertImageByURL
            }
        }
    }
});

function insertImageByURL() {
    const url = prompt("Paste the image URL:");
    if (!url) return;

    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, "image", url);
}

async function loadPost() {
    try {
        const response = await fetch(`/blogs/${postId}`);
        const post = await response.json();

        if (!response.ok) throw new Error(post.message || "Could not load this post.");

        titleInput.value = post.title;
        quill.root.innerHTML = post.content;
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
        const content = quill.root.innerHTML.trim();
        const isEmpty = quill.getText().trim().length === 0;

        if (isEmpty) {
            throw new Error("Please write something before saving.");
        }

        const response = await fetch(`/blogs/${postId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: titleInput.value,
                content: content
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to update blog post");

        alert(data.message);
        window.location.href = `blog-post.html?id=${postId}`;
    } catch (error) {
        alert(error.message);
        button.disabled = false;
        button.textContent = "Save Changes";
    }
});

loadPost();