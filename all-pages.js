const isAdmin = !!localStorage.getItem("username");

async function loadPages() {

    try {

        const response = await fetch("/pages");

        const pages = await response.json();

        console.log("Pages:", pages);

        const videos = document.getElementById("videos");

        videos.innerHTML = "";


        pages.forEach(function(page) {

            let videoId = "";

            if (page.youtube_url.includes("watch?v=")) {

                videoId = page.youtube_url.split("watch?v=")[1];

            }

            else if (page.youtube_url.includes("youtu.be/")) {

                videoId = page.youtube_url.split("youtu.be/")[1];

            }

            else if (page.youtube_url.includes("/embed/")) {

                videoId = page.youtube_url.split("/embed/")[1];

            }


            videoId = videoId.split("&")[0];


            const video = document.createElement("div");

            video.className = "video";


            video.innerHTML = `

                <iframe
                    src="https://www.youtube.com/embed/${videoId}"
                    title="${page.title}"
                    allowfullscreen>
                </iframe>

                <h3>${page.title}</h3>

                <p>${page.description || ""}</p>

                ${isAdmin ? `
                <div class="buttons">

                    <button
                        class="edit-btn"
                        onclick="editTitle(${page.id})"
                        title="Edit Title">

                        <i class="fa-solid fa-pencil"></i>

                    </button>


                    <button
                        class="delete-btn"
                        onclick="deletePage(${page.id})"
                        title="Delete">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>` : ""}

            `;


            videos.appendChild(video);

        });

    }

    catch (error) {

        console.log("Error:", error);

    }

}



async function editTitle(id) {

    if (!isAdmin) {
        return;
    }

    const newTitle = prompt("Enter new title:");

    if (newTitle === null) {
        return;
    }

    if (newTitle.trim() === "") {

        alert("Title cannot be empty");

        return;

    }


    const response = await fetch(
        `/pages/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: newTitle
            })
        }
    );


    const data = await response.json();

    alert(data.message);

    loadPages();

}



async function deletePage(id) {

    if (!isAdmin) {
        return;
    }

    const answer = confirm(
        "Are you sure you want to delete this video?"
    );


    if (!answer) {
        return;
    }


    const response = await fetch(
        `/pages/${id}`,
        {
            method: "DELETE"
        }
    );


    const data = await response.json();

    alert(data.message);

    loadPages();

}


loadPages();