const publishedBlogs = document.querySelector("#published-blogs");

function excerpt(content) {
    return content.length > 130 ? `${content.slice(0, 130)}…` : content;
}

async function loadPublishedBlogs() {
    try {
        const response = await fetch("http://127.0.0.1:3000/blogs");
        const posts = await response.json();

        if (!response.ok) {
            throw new Error();
        }

        posts.forEach((post) => {
            const card = document.createElement("a");
            card.className = "topic-card published-post-card";
            card.href = `blog-post.html?id=${post.id}`;

            const date = new Date(post.created_at).toLocaleDateString();
            card.innerHTML = `<span>Blog post</span><h2></h2><p></p><time></time>`;
            card.querySelector("h2").textContent = post.title;
            card.querySelector("p").textContent = excerpt(post.content);
            card.querySelector("time").textContent = date;
            publishedBlogs.appendChild(card);
        });
    } catch {
        publishedBlogs.innerHTML = "";
    }
}

loadPublishedBlogs();
