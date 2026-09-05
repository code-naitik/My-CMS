requireLogin();

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
    placeholder: "Write your blog post here...",
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

const form = document.querySelector("#blog-form");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Publishing...";

    try {
        const title = document.querySelector("#title").value.trim();
        const content = quill.root.innerHTML.trim();
        const isEmpty = quill.getText().trim().length === 0;
        const attachmentInput = document.querySelector("#attachment");

        if (isEmpty) {
            throw new Error("Please write something before publishing.");
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (attachmentInput.files[0]) {
            formData.append("attachment", attachmentInput.files[0]);
        }

        const response = await fetch("/blogs", {
            method: "POST",
            credentials: "same-origin",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to publish blog post");
        }

        alert(data.message);
        window.location.href = `blog-post.html?id=${data.id}`;

    } catch (error) {
        console.error("Blog publishing error:", error);
        alert(error.message || "Server connection failed");
        button.disabled = false;
        button.textContent = "Publish Blog";
    }
});