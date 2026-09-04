require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();

const port = Number(process.env.PORT || 3000);


// ======================================================
// FILE UPLOADS (blog attachments)
// ======================================================

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedAttachmentTypes = [
    ".pdf", ".doc", ".docx", ".ppt", ".pptx",
    ".xls", ".xlsx", ".txt", ".zip"
];

const attachmentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const uploadAttachment = multer({
    storage: attachmentStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedAttachmentTypes.includes(ext)) {
            return cb(new Error("That file type isn't allowed"));
        }
        cb(null, true);
    }
});


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());


// ======================================================
// SESSION-BASED AUTH
//
// /login previously only checked the DB and replied with a
// message — it never issued anything to prove you were logged
// in. The dashboard link and admin pages were only hidden by a
// localStorage flag the browser sets, which anyone can set
// themselves (or just visit the page/API directly). This block
// adds a real server-side session so every admin page and
// admin API route can actually verify the request is logged in.
// ======================================================

const sessions = new Map(); // token -> { username, expires }
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function createSession(username) {
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { username, expires: Date.now() + SESSION_DURATION });
    return token;
}

function getSessionFromRequest(req) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const match = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("sid="));

    if (!match) return null;

    const token = match.slice(4);
    const session = sessions.get(token);

    if (!session) return null;

    if (session.expires < Date.now()) {
        sessions.delete(token);
        return null;
    }

    return { token, ...session };
}

// Use on any admin-only API route (adding/editing/deleting content).
function requireAuth(req, res, next) {
    const session = getSessionFromRequest(req);

    if (!session) {
        return res.status(401).json({
            message: "Please log in"
        });
    }

    req.username = session.username;
    next();
}

// Serve the admin-only HTML pages themselves only to logged-in
// users. These routes are registered before express.static, so
// Express matches them first and static never gets a chance to
// hand the file out for free.
const adminPages = [
    "dashboard.html",
    "add-blog.html",
    "edit-blog.html",
    "add-page.html",
    "edit-topic.html",
    "enquiries.html"
];

adminPages.forEach((page) => {
    app.get(`/${page}`, (req, res) => {
        const session = getSessionFromRequest(req);

        if (!session) {
            return res.redirect("/admin-login.html");
        }

        res.sendFile(path.join(__dirname, page));
    });
});

app.use(express.static(__dirname));


// ======================================================
// AIVEN MYSQL CONNECTION
// ======================================================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false
    }
});


// ======================================================
// TEST MYSQL CONNECTION
// ======================================================

db.connect((err) => {

    if (err) {
        console.error("❌ Aiven MySQL connection failed:");
        console.error(err.message);
        return;
    }

    console.log("✅ Aiven MySQL connected!");
});


// ======================================================
// LOGIN
// ======================================================

app.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    const sql = `
        SELECT *
        FROM admins
        WHERE username = ? AND password = ?
    `;

    db.query(sql, [username, password], (err, result) => {

        if (err) {
            console.error("Login database error:", err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        if (result.length > 0) {

            const token = createSession(username);

            res.cookie("sid", token, {
                httpOnly: true,
                sameSite: "lax",
                maxAge: SESSION_DURATION
            });

            return res.json({
                message: "Login successful"
            });

        }

        res.status(401).json({
            message: "Wrong username or password"
        });

    });

});


// LOGOUT

app.post("/logout", (req, res) => {

    const session = getSessionFromRequest(req);

    if (session) {
        sessions.delete(session.token);
    }

    res.clearCookie("sid");

    res.json({
        message: "Logged out"
    });

});


// CHECK CURRENT SESSION

app.get("/me", (req, res) => {

    const session = getSessionFromRequest(req);

    if (!session) {
        return res.status(401).json({
            message: "Not logged in"
        });
    }

    res.json({
        username: session.username
    });

});


// ======================================================
// CONTACT MESSAGES
// ======================================================

// ADD CONTACT MESSAGE

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
        INSERT INTO contact_messages
        (name, email, subject, message)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [name, email, subject, message],
        (err) => {

            if (err) {

                console.error("Contact message error:", err);

                return res.status(500).json({
                    message: "Failed to send message"
                });

            }

            res.status(201).json({
                message: "Message sent"
            });

        }
    );

});


// GET CONTACT MESSAGES

app.get("/contact-messages", requireAuth, (req, res) => {

    const sql = `
        SELECT *
        FROM contact_messages
        ORDER BY created_at DESC, id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.error("Load messages error:", err);

            return res.status(500).json({
                message: "Failed to load messages"
            });

        }

        res.json(result);

    });

});


// ======================================================
// BLOG POSTS
// ======================================================

// GET ALL BLOG POSTS

app.get("/blogs", (req, res) => {

    const sql = `
        SELECT id, title, content, attachment_name, attachment_path, created_at
        FROM blog_posts
        ORDER BY created_at DESC, id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.error("Load blogs error:", err);

            return res.status(500).json({
                message: "Failed to load blog posts"
            });

        }

        res.json(result);

    });

});


// GET SINGLE BLOG POST

app.get("/blogs/:id", (req, res) => {

    const sql = `
        SELECT id, title, content, attachment_name, attachment_path, created_at
        FROM blog_posts
        WHERE id = ?
    `;

    db.query(sql, [req.params.id], (err, result) => {

        if (err) {

            console.error("Load blog error:", err);

            return res.status(500).json({
                message: "Failed to load blog post"
            });

        }

        if (result.length === 0) {

            return res.status(404).json({
                message: "Blog post not found"
            });

        }

        res.json(result[0]);

    });

});


// ADD BLOG POST

app.post("/blogs", requireAuth, uploadAttachment.single("attachment"), (req, res) => {

    const title = req.body.title?.trim();
    const content = req.body.content?.trim();

    if (!title || !content) {

        // Clean up an uploaded file if validation fails after upload
        if (req.file) fs.unlink(req.file.path, () => {});

        return res.status(400).json({
            message: "Please add a title and content"
        });

    }

    const attachmentName = req.file ? req.file.originalname : null;
    const attachmentPath = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `
        INSERT INTO blog_posts
        (title, content, attachment_name, attachment_path)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [title, content, attachmentName, attachmentPath],
        (err, result) => {

            if (err) {

                console.error("Add blog error:", err);

                return res.status(500).json({
                    message: "Failed to publish blog post"
                });

            }

            res.status(201).json({
                message: "Blog published successfully",
                id: result.insertId
            });

        }
    );

});


// EDIT BLOG POST

app.put("/blogs/:id", requireAuth, uploadAttachment.single("attachment"), (req, res) => {

    const id = req.params.id;

    const title = req.body.title?.trim();
    const content = req.body.content?.trim();
    const removeAttachment = req.body.removeAttachment === "true";

    if (!title || !content) {

        if (req.file) fs.unlink(req.file.path, () => {});

        return res.status(400).json({
            message: "Please add a title and content"
        });

    }

    // Find the existing attachment first, in case we need to delete the old file
    db.query(
        "SELECT attachment_path FROM blog_posts WHERE id = ?",
        [id],
        (findErr, findResult) => {

            if (findErr) {
                console.error("Lookup blog error:", findErr);
                if (req.file) fs.unlink(req.file.path, () => {});
                return res.status(500).json({ message: "Failed to update blog post" });
            }

            const existingPath = findResult[0]?.attachment_path;

            let attachmentName;
            let attachmentPath;

            if (req.file) {
                // A new file was uploaded — replace the old one
                attachmentName = req.file.originalname;
                attachmentPath = `/uploads/${req.file.filename}`;
            } else if (removeAttachment) {
                // User asked to remove the attachment, no replacement
                attachmentName = null;
                attachmentPath = null;
            } else {
                // Keep whatever was there before
                attachmentName = findResult[0]?.attachment_name ?? null;
                attachmentPath = existingPath ?? null;
            }

            const sql = `
                UPDATE blog_posts
                SET title = ?, content = ?, attachment_name = ?, attachment_path = ?
                WHERE id = ?
            `;

            db.query(
                sql,
                [title, content, attachmentName, attachmentPath, id],
                (err, result) => {

                    if (err) {

                        console.error("Update blog error:", err);

                        return res.status(500).json({
                            message: "Failed to update blog post"
                        });

                    }

                    // If we replaced or removed an old file, delete it from disk
                    const oldFileChanged = existingPath && existingPath !== attachmentPath;
                    if (oldFileChanged) {
                        const oldFilePath = path.join(__dirname, existingPath);
                        fs.unlink(oldFilePath, () => {});
                    }

                    res.json({
                        message: "Blog post updated successfully"
                    });

                }
            );

        }
    );

});


// DELETE BLOG POST

app.delete("/blogs/:id", requireAuth, (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT attachment_path FROM blog_posts WHERE id = ?",
        [id],
        (findErr, findResult) => {

            const attachmentPath = findResult?.[0]?.attachment_path;

            const sql = `
                DELETE FROM blog_posts
                WHERE id = ?
            `;

            db.query(sql, [id], (err, result) => {

                if (err) {

                    console.error("Delete blog error:", err);

                    return res.status(500).json({
                        message: "Failed to delete blog post"
                    });

                }

                if (attachmentPath) {
                    fs.unlink(path.join(__dirname, attachmentPath), () => {});
                }

                res.json({
                    message: "Blog post deleted successfully"
                });

            });

        }
    );

});


// ======================================================
// TOPICS
// ======================================================

// GET ALL TOPICS

app.get("/topics", (req, res) => {

    const sql = `
        SELECT id, title, content, created_at
        FROM topics
        ORDER BY id ASC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.error("Load topics error:", err);

            return res.status(500).json({
                message: "Failed to load topics"
            });

        }

        res.json(result);

    });

});


// GET SINGLE TOPIC

app.get("/topics/:id", (req, res) => {

    const sql = `
        SELECT id, title, content, created_at
        FROM topics
        WHERE id = ?
    `;

    db.query(sql, [req.params.id], (err, result) => {

        if (err) {

            console.error("Load topic error:", err);

            return res.status(500).json({
                message: "Failed to load topic"
            });

        }

        if (result.length === 0) {

            return res.status(404).json({
                message: "Topic not found"
            });

        }

        res.json(result[0]);

    });

});


// EDIT TOPIC

app.put("/topics/:id", requireAuth, (req, res) => {

    const title = req.body.title?.trim();
    const content = req.body.content?.trim();

    if (!title || !content) {

        return res.status(400).json({
            message: "Please add a title and content"
        });

    }

    const sql = `
        UPDATE topics
        SET title = ?, content = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [title, content, req.params.id],
        (err, result) => {

            if (err) {

                console.error("Update topic error:", err);

                return res.status(500).json({
                    message: "Failed to update topic"
                });

            }

            res.json({
                message: "Topic updated successfully"
            });

        }
    );

});


// DELETE TOPIC

app.delete("/topics/:id", requireAuth, (req, res) => {

    const sql = `
        DELETE FROM topics
        WHERE id = ?
    `;

    db.query(sql, [req.params.id], (err, result) => {

        if (err) {

            console.error("Delete topic error:", err);

            return res.status(500).json({
                message: "Failed to delete topic"
            });

        }

        res.json({
            message: "Topic deleted successfully"
        });

    });

});


// ======================================================
// PAGES
// ======================================================

// GET ALL PAGES

app.get("/pages", (req, res) => {

    const sql = `
        SELECT *
        FROM pages
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.error("Load pages error:", err);

            return res.status(500).json({
                message: "Database error"
            });

        }

        res.json(result);

    });

});


// ADD NEW PAGE

app.post("/pages", requireAuth, (req, res) => {

    const title = req.body.title?.trim();
    const youtube_url = req.body.youtube_url?.trim();
    const description = req.body.description?.trim();

    if (!title || !youtube_url || !description) {

        return res.status(400).json({
            message: "Please fill in all fields"
        });

    }

    const sql = `
        INSERT INTO pages
        (title, youtube_url, description)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [title, youtube_url, description],
        (err, result) => {

            if (err) {

                console.error("Add page error:", err);

                return res.status(500).json({
                    message: "Failed to add page"
                });

            }

            res.status(201).json({
                message: "Page added successfully",
                id: result.insertId
            });

        }
    );

});


// DELETE PAGE

app.delete("/pages/:id", requireAuth, (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM pages
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.error("Delete page error:", err);

            return res.status(500).json({
                message: "Failed to delete page"
            });

        }

        res.json({
            message: "Page deleted successfully"
        });

    });

});


// EDIT PAGE TITLE

app.put("/pages/:id", requireAuth, (req, res) => {

    const id = req.params.id;
    const title = req.body.title?.trim();

    if (!title) {

        return res.status(400).json({
            message: "Title is required"
        });

    }

    const sql = `
        UPDATE pages
        SET title = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [title, id],
        (err, result) => {

            if (err) {

                console.error("Update page error:", err);

                return res.status(500).json({
                    message: "Failed to update title"
                });

            }

            res.json({
                message: "Title updated successfully"
            });

        }
    );

});

// ======================================================
// HOME PAGE
// ======================================================

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// ======================================================
// FILE UPLOAD ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err) {
        return res.status(400).json({
            message: err.message || "File upload failed"
        });
    }
    next();
});

// ======================================================
// START SERVER
// ======================================================

app.listen(port, () => {

    console.log(`🚀 Server running on port ${port}`);

});