const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const container = document.querySelector("#blog-content");

if (!id) {
    container.innerHTML = `
        <p>Blog post ID is missing.</p>
    `;
} else {

    loadBlog();
}


async function loadBlog() {

    try {

        const response = await fetch(
            `/blogs/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load blog");
        }

        const title = document.createElement("h1");
        title.textContent = data.title;

        const date = document.createElement("p");
        date.className = "date";
        date.textContent = new Date(data.created_at).toLocaleDateString();

        const contentDiv = document.createElement("div");
        contentDiv.className = "content";
        contentDiv.innerHTML = data.content;

        const article = document.createElement("article");
        article.className = "blog-post";
        article.append(title, date, contentDiv);

        container.replaceChildren(article);

    } catch (error) {

        console.error("Blog loading error:", error);

        container.innerHTML = `
            <p>${error.message}</p>
        `;
    }
}