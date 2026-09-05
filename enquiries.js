requireLogin();
wireLogoutLink();

const messagesContainer = document.querySelector("#contact-messages");
const messagesStatus = document.querySelector("#messages-status");

function formatDate(value) {
    return new Date(value).toLocaleString();
}

function createMessageCard(contactMessage) {
    const card = document.createElement("article");
    card.className = "message-card";

    const subject = document.createElement("h3");
    subject.textContent = contactMessage.subject;

    const sender = document.createElement("p");
    sender.className = "message-sender";
    sender.textContent = `${contactMessage.name} · ${contactMessage.email}`;

    const message = document.createElement("p");
    message.className = "message-body";
    message.textContent = contactMessage.message;

    const date = document.createElement("time");
    date.textContent = formatDate(contactMessage.created_at);

    card.append(subject, sender, message, date);
    return card;
}

async function loadContactMessages() {
    messagesStatus.textContent = "Loading messages...";
    messagesContainer.replaceChildren();

    try {
        const response = await fetch("/contact-messages", { credentials: "same-origin" });
        const messages = await response.json();

        if (!response.ok) {
            throw new Error(messages.message || "Could not load enquiries.");
        }

        if (messages.length === 0) {
            messagesStatus.textContent = "No enquiries yet.";
            return;
        }

        messagesStatus.textContent = `${messages.length} enquir${messages.length === 1 ? "y" : "ies"}`;
        messages.forEach((contactMessage) => {
            messagesContainer.appendChild(createMessageCard(contactMessage));
        });
    } catch (error) {
        messagesStatus.textContent = error.message || "Could not load enquiries.";
    }
}

document.querySelector("#refresh-messages").addEventListener("click", loadContactMessages);
loadContactMessages();