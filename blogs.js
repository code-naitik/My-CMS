const publishedBlogs = document.querySelector("#published-blogs");
const topicNotes = document.querySelector("#topic-notes");
let isAdmin = false;

function excerpt(content) {
    const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return plainText.length > 130 ? `${plainText.slice(0, 130)}…` : plainText;
}

// ----- Published Blog Posts -----

async function loadPublishedBlogs() {
    try {
        const response = await fetch("/blogs");
        const posts = await response.json();

        if (!response.ok) {
            throw new Error();
        }

        publishedBlogs.innerHTML = "";

        posts.forEach((post) => {
            const date = new Date(post.created_at).toLocaleDateString();

            const card = document.createElement("div");
            card.className = "topic-card published-post-card";

            card.innerHTML = `
                <a href="blog-post.html?id=${post.id}" class="post-link">
                    <span>Blog post</span>
                    <h2>${post.title}</h2>
                    <p>${excerpt(post.content)}</p>
                    <time>${date}</time>
                </a>
                ${isAdmin ? `
                <div class="buttons">
                    <button class="edit-btn" onclick="editBlog(${post.id})" title="Edit">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteBlog(${post.id})" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>` : ""}
            `;

            publishedBlogs.appendChild(card);
        });
    } catch {
        publishedBlogs.innerHTML = "";
    }
}

function editBlog(id) {
    window.location.href = `edit-blog.html?id=${id}`;
}

async function deleteBlog(id) {
    const confirmed = confirm("Are you sure you want to delete this blog post?");
    if (!confirmed) return;

    const response = await fetch(`/blogs/${id}`, {
        method: "DELETE",
        credentials: "same-origin"
    });

    const data = await response.json();
    alert(data.message);
    loadPublishedBlogs();
}

// ----- Topic Notes -----

async function loadTopics() {
    try {
        const response = await fetch("/topics");
        const topics = await response.json();

        if (!response.ok) throw new Error();

        topicNotes.innerHTML = "";

        topics.forEach((topic, index) => {
            const card = document.createElement("div");
            card.className = "topic-card published-post-card";

            card.innerHTML = `
                <a href="blog-notes.html?id=${topic.id}" class="post-link">
                    <span>${String(index + 1).padStart(2, "0")}</span>
                    <h2>${topic.title}</h2>
                    <p>${excerpt(topic.content)}</p>
                </a>
                ${isAdmin ? `
                <div class="buttons">
                    <button class="edit-btn" onclick="editTopic(${topic.id})" title="Edit">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteTopic(${topic.id})" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>` : ""}
            `;

            topicNotes.appendChild(card);
        });
    } catch {
        topicNotes.innerHTML = "";
    }
}

function editTopic(id) {
    window.location.href = `edit-topic.html?id=${id}`;
}

async function deleteTopic(id) {
    const confirmed = confirm("Are you sure you want to delete this topic?");
    if (!confirmed) return;

    const response = await fetch(`/topics/${id}`, {
        method: "DELETE",
        credentials: "same-origin"
    });
    const data = await response.json();
    alert(data.message);
    loadTopics();
}

const dashboardLink = document.querySelector("#dashboard-link");

fetch("/session", { credentials: "same-origin" })
    .then((res) => res.json())
    .then((data) => {
        isAdmin = !!data.loggedIn;
        loadPublishedBlogs();
        loadTopics();
        dashboardLink.style.display = isAdmin ? "inline" : "none";
    })
    .catch(() => {
        loadPublishedBlogs();
        loadTopics();
        dashboardLink.style.display = "none";
    });