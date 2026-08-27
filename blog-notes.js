const topics = {
    html: {
        title: "HTML Notes",
        intro: "HTML gives a web page its structure and meaning.",
        points: ["Use semantic elements such as <code>header</code>, <code>main</code>, <code>section</code>, and <code>footer</code>.", "Every page needs a document structure: <code>&lt;!DOCTYPE html&gt;</code>, <code>html</code>, <code>head</code>, and <code>body</code>.", "Use labels with form controls and meaningful <code>alt</code> text for images."],
        example: "<main>\n  <h1>My page</h1>\n  <p>Welcome!</p>\n</main>"
    },
    css: {
        title: "CSS Notes",
        intro: "CSS controls presentation: layout, color, spacing, typography, and responsiveness.",
        points: ["Selectors choose elements; declarations apply properties such as <code>color</code> and <code>margin</code>.", "Use Flexbox for one-dimensional layouts and Grid for rows-and-columns layouts.", "Use media queries to adapt a design to smaller screens."],
        example: ".card {\n  display: grid;\n  gap: 16px;\n  padding: 24px;\n}"
    },
    javascript: {
        title: "JavaScript Notes",
        intro: "JavaScript makes pages interactive and lets the browser work with APIs.",
        points: ["Use <code>const</code> for values that are not reassigned and <code>let</code> when they are.", "Use event listeners to react to clicks and form submissions.", "Use <code>async/await</code> with <code>fetch</code> for asynchronous API requests."],
        example: "button.addEventListener('click', () => {\n  alert('Hello!');\n});"
    },
    python: {
        title: "Python Notes",
        intro: "Python is a readable language used for automation, web development, data work, and more.",
        points: ["Indentation defines code blocks in Python.", "Lists, dictionaries, tuples, and sets are core collection types.", "Functions are declared with <code>def</code>; packages can be installed with <code>pip</code>."],
        example: "def greet(name):\n    return f'Hello, {name}!'\n\nprint(greet('Naitik'))"
    },
    nodejs: {
        title: "Node.js Notes",
        intro: "Node.js lets you execute JavaScript outside the browser, commonly for servers and tools.",
        points: ["Use <code>npm</code> to install and manage project packages.", "Node uses an event-driven, non-blocking model that suits I/O tasks.", "Keep secrets such as database passwords in environment variables."],
        example: "const http = require('http');\n\nhttp.createServer((req, res) => {\n  res.end('Hello from Node');\n}).listen(3000);"
    },
    expressjs: {
        title: "Express.js Notes",
        intro: "Express is a minimal Node.js framework for creating APIs and web servers.",
        points: ["Routes match an HTTP method and URL, for example <code>app.get()</code> or <code>app.post()</code>.", "Middleware such as <code>express.json()</code> processes requests before route handlers.", "Use appropriate status codes: 200 for success, 201 for a new item, and 404 when an item is missing."],
        example: "app.get('/api/hello', (req, res) => {\n  res.json({ message: 'Hello' });\n});"
    },
    reactjs: {
        title: "React.js Notes",
        intro: "React builds interfaces from reusable components and updates the page when state changes.",
        points: ["Components are JavaScript functions that return JSX.", "Props pass data into a component; state stores data that can change.", "Use <code>useEffect</code> for side effects such as API calls."],
        example: "function Welcome({ name }) {\n  return <h1>Hello, {name}</h1>;\n}"
    }
};

const key = new URLSearchParams(window.location.search).get("topic");
const topic = topics[key];
const notes = document.querySelector("#notes");

if (!topic) {
    notes.innerHTML = "<h1>Topic not found</h1><p>Please return to the blog list and choose a topic.</p>";
} else {
    document.title = `${topic.title} | Naitik`;
    notes.innerHTML = `
        <h1>${topic.title}</h1>
        <p>${topic.intro}</p>
        <h2>Key concepts</h2>
        <ul>${topic.points.map((point) => `<li>${point}</li>`).join("")}</ul>
        <h2>Example</h2>
        <pre><code>${topic.example.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
    `;
}
