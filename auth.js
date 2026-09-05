async function getSession() {
    try {
        const res = await fetch("/session", { credentials: "same-origin" });
        return await res.json();
    } catch {
        return { loggedIn: false };
    }
}

// Call on every admin-only page
async function requireLogin() {
    const session = await getSession();

    if (!session.loggedIn) {
        window.location.replace("admin-login.html");
        return null;
    }

    const userSpan = document.querySelector("#username");
    if (userSpan) userSpan.textContent = session.username;

    return session;
}

async function logoutAdmin() {
    try {
        await fetch("/logout", { method: "POST", credentials: "same-origin" });
    } finally {
        window.location.replace("home.html");
    }
}

function wireLogoutLink() {
    const link = document.querySelector("#logout-link");
    if (link) {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            logoutAdmin();
        });
    }
}

// Catches the back/forward-cache case: browser restores the page from
// memory (without asking the server) when you hit the back button.
// This forces a fresh session check whenever that happens.
window.addEventListener("pageshow", async (event) => {
    if (event.persisted) {
        const session = await getSession();
        if (!session.loggedIn) {
            window.location.replace("admin-login.html");
        }
    }
});