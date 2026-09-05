requireLogin();
wireLogoutLink();

const form = document.querySelector("#page-form");


// ADD PAGE

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const title = document.querySelector("#title").value;

    const youtube_url = document.querySelector("#youtube_url").value;

    const description = document.querySelector("#description").value;


    const response = await fetch("/pages", {

        method: "POST",
        credentials: "same-origin",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            title: title,
            youtube_url: youtube_url,
            description: description
        })

    });


    const data = await response.json();

    alert(data.message);


    if (data.message === "Page added successfully") {

        form.reset();

        loadPages();

    }

});


// LOAD PAGES

async function loadPages() {

    const response = await fetch(
        "/pages"
    );

    const pages = await response.json();

    const container = document.querySelector("#pages");

    container.innerHTML = "";


    pages.forEach(function(page) {

        const div = document.createElement("div");

        div.className = "page";

        div.innerHTML = `
            <h3>${page.title}</h3>

            <p>${page.description}</p>

            <a href="${page.youtube_url}" target="_blank">
                Watch Video
            </a>

            <br>

            <button
                class="delete-btn"
                onclick="deletePage(${page.id})">
                Delete
            </button>
        `;

        container.appendChild(div);

    });

}


// DELETE PAGE

async function deletePage(id) {

    const answer = confirm(
        "Are you sure you want to delete this page?"
    );

    if (!answer) {
        return;
    }


    const response = await fetch(
        `/pages/${id}`,
        {
            method: "DELETE",
            credentials: "same-origin"
        }
    );


    const data = await response.json();

    alert(data.message);

    loadPages();

}


// LOAD WHEN PAGE OPENS

loadPages();