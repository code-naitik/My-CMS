const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());


// MySQL connection

const db = mysql.createConnection({
    user: process.env.DB_USER || "cms_user",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_NAME || "login_system",
    // Use the local MySQL socket. This matches `mysql -u cms_user -p`.
    socketPath: process.env.DB_SOCKET || "/var/run/mysqld/mysqld.sock"
});


db.connect((err) => {

    if (err) {
        console.error("MySQL connection failed:", err.message);
        console.error("Set DB_PASSWORD to the password for the configured MySQL user.");
        return;
    }

    console.log("MySQL connected!");

});


// LOGIN

app.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const sql = "SELECT * FROM admins WHERE username = ? AND password = ?";

    db.query(sql, [username, password], (err, result) => {

        if (err) {
            console.log(err);

            return res.json({
                message: "Database error"
            });
        }

        if (result.length > 0) {

            res.json({
                message: "Login successful"
            });

        } else {

            res.json({
                message: "Wrong username or password"
            });

        }

    });

});

// CONTACT MESSAGES

app.post("/contact-messages", (req, res) => {

    const name = req.body.name?.trim();
    const email = req.body.email?.trim();
    const subject = req.body.subject?.trim();
    const message = req.body.message?.trim();

    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            message: "Please fill in every field"
        });
    }

    const sql = `
        INSERT INTO contact_messages (name, email, subject, message)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [name, email, subject, message], (err) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to send message"
            });
        }

        res.status(201).json({
            message: "Message sent"
        });
    });
});

app.get("/contact-messages", (req, res) => {

    const sql = "SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC";

    db.query(sql, (err, result) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to load messages"
            });
        }

        res.json(result);
    });
});

// BLOG POSTS

app.get("/blogs", (req, res) => {

    const sql = "SELECT id, title, content, created_at FROM blog_posts ORDER BY created_at DESC, id DESC";

    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to load blog posts" });
        }

        res.json(result);
    });
});

app.get("/blogs/:id", (req, res) => {

    const sql = "SELECT id, title, content, created_at FROM blog_posts WHERE id = ?";

    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to load blog post" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Blog post not found" });
        }

        res.json(result[0]);
    });
});

app.post("/blogs", (req, res) => {

    const title = req.body.title?.trim();
    const content = req.body.content?.trim();

    if (!title || !content) {
        return res.status(400).json({ message: "Please add a title and content" });
    }

    const sql = "INSERT INTO blog_posts (title, content) VALUES (?, ?)";

    db.query(sql, [title, content], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Failed to publish blog post" });
        }

        res.status(201).json({
            message: "Blog published successfully",
            id: result.insertId
        });
    });
});


// GET ALL PAGES

app.get("/pages", (req, res) => {

    const sql = "SELECT * FROM pages ORDER BY id DESC";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.json({
                message: "Database error"
            });
        }

        res.json(result);

    });

});


// ADD NEW PAGE

app.post("/pages", (req, res) => {

    const title = req.body.title;
    const youtube_url = req.body.youtube_url;
    const description = req.body.description;

    const sql = `
        INSERT INTO pages (title, youtube_url, description)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [title, youtube_url, description],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.json({
                    message: "Failed to add page"
                });
            }

            res.json({
                message: "Page added successfully"
            });

        }
    );

});


// DELETE PAGE

app.delete("/pages/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM pages WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);

            return res.json({
                message: "Failed to delete page"
            });
        }

        res.json({
            message: "Page deleted successfully"
        });

    });

});

// EDIT PAGE TITLE

app.put("/pages/:id", (req, res) => {

    const id = req.params.id;
    const title = req.body.title;

    const sql = "UPDATE pages SET title = ? WHERE id = ?";

    db.query(sql, [title, id], (err, result) => {

        if (err) {
            console.log(err);

            return res.json({
                message: "Failed to update title"
            });
        }

        res.json({
            message: "Title updated successfully"
        });

    });

});


// START SERVER

app.listen(port, () => {

    console.log(`Server running on port ${port}`);

});
