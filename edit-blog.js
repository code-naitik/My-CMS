requireLogin();

const postId = new URLSearchParams(window.location.search).get("id");
const form = document.querySelector("#blog-form");
const titleInput = document.querySelector("#title");

// Register a custom format so the underline itself can have its own color
const Parchment = Quill.import("parchment");
const UnderlineColorStyle = new Parchment.StyleAttributor(
    "underlineColor",
    "text-decoration-color",
    { scope: Parchment.Scope.INLINE }
);
Quill.register(UnderlineColorStyle, true);

const quill = new Quill("#editor", {
    theme: "snow",
    modules: {
        toolbar: {
            container: "#toolbar",
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

// ----- Underline color popup -----

const underlineBtn = document.querySelector("#underline-btn");
const underlinePopup = document.querySelector("#underline-color-popup");
let savedSelection = null;

underlineBtn.addEventListener("click", () => {
    savedSelection = quill.getSelection();

    if (!savedSelection || savedSelection.length === 0) {
        alert("Select some text first, then click the U button.");
        return;
    }

    underlinePopup.classList.toggle("open");
});

document.querySelectorAll(".color-swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {

        if (!savedSelection) return;

        const color = swatch.dataset.color;

        if (color === "none") {
            quill.formatText(savedSelection.index, savedSelection.length, {
                underline: false,
                underlineColor: false
            });
        } else if (color === "") {
            quill.formatText(savedSelection.index, savedSelection.length, {
                underline: true,
                underlineColor: false
            });
        } else {
            quill.formatText(savedSelection.index, savedSelection.length, {
                underline: true,
                underlineColor: color
            });
        }

        underlinePopup.classList.remove("open");
    });
});

// Close the popup if clicking anywhere else
document.addEventListener("click", (event) => {
    if (!event.target.closest(".underline-wrapper")) {
        underlinePopup.classList.remove("open");
    }
});

async function loadPost() {
    try {
        const response = await fetch(`/blogs/${postId}`);
        const post = await response.json();

        if (!response.ok) throw new Error(post.message || "Could not load this post.");

        titleInput.value = post.title;
        quill.root.innerHTML = post.content;

        if (post.attachment_path) {
            const currentAttachment = document.querySelector("#current-attachment");
            const currentAttachmentLink = document.querySelector("#current-attachment-link");
            currentAttachmentLink.href = post.attachment_path;
            currentAttachmentLink.textContent = `📎 ${post.attachment_name}`;
            currentAttachment.style.display = "block";
        }
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
        const attachmentInput = document.querySelector("#attachment");
        const removeAttachment = document.querySelector("#remove-attachment").checked;

        if (isEmpty) {
            throw new Error("Please write something before saving.");
        }

        const formData = new FormData();
        formData.append("title", titleInput.value);
        formData.append("content", content);
        formData.append("removeAttachment", removeAttachment ? "true" : "false");
        if (attachmentInput.files[0]) {
            formData.append("attachment", attachmentInput.files[0]);
        }

        const response = await fetch(`/blogs/${postId}`, {
            method: "PUT",
            credentials: "same-origin",
            body: formData
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