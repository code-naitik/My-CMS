async function loadVideos() {

    try {

        const response = await fetch("/pages");

        const pages = await response.json();

        const container = document.querySelector(".videos");

        container.innerHTML = "";

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

            `;

            container.appendChild(video);

        });

    }

    catch (error) {

        console.log("Error loading videos:", error);

    }

}

loadVideos();

const username = localStorage.getItem("username");

const dashboardLink = document.querySelector("#dashboard-link");
const adminLoginLink = document.querySelector("#admin-login-link");

if (username) {
    dashboardLink.style.display = "inline";
    adminLoginLink.style.display = "none";
} else {
    dashboardLink.style.display = "none";
    adminLoginLink.style.display = "inline";
}