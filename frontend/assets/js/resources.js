// Simulated role check
const role = localStorage.getItem("role");

// redirect non-logged users back to landing (optional)
const token = localStorage.getItem("token");
if (!token) {
    alert("Please login to view resources.");
    window.location.href = "../index.html";
}

// toggle login/profile buttons
if (token) {
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("profileBtn").style.display = "inline-block";
}

// show admin-specific sections
if (role === "admin") {
    document.getElementById("adminTopicSection").style.display = "flex";
}

// data structure holding topics and links (each resource now has a title and a URL)
let topics = [
    // sample topic to give user a starting view
    {
        name: "Game Theory",
        classes: [
            { name: "Game Theory-1", url: "https://www.youtube.com/live/2GoUYpQlAUY?si=rnPvKetHp0pesSoj" },
            { name: "Game Theory-2", url: "https://www.youtube.com/live/EienAWnUPow?si=H0JgRZkW9gGpPXqt" }
        ],
        blogs: [],
        contests: [],
        editorials: [] // editorial text strings
    },

    {
        name: "Graph",
        classes: [
            { name: "Graph-1", url: "https://www.youtube.com/live/iKCnz0k4C5c?si=tqJSV_Fk8uvbfc6n" }
        ],
        blogs: [],
        contests: [],
        editorials: [] // editorial text strings
    }
];

// render helper
function renderTopics() {
    const container = document.getElementById("topicsList");
    container.innerHTML = "";

    topics.forEach((topic, idx) => {
        const card = document.createElement("div");
        card.classList.add("resource-topic");
        
        function listSection(arr, type) {
            if (!arr || arr.length === 0) {
                return '<p class="empty">Not uploaded yet</p>';
            }
            if (type === 'editorial') {
                return '<ul>' + arr.map((ed, i) => `<li><a href="#" onclick="viewEditorial(${idx},${i})">${ed.substring(0,30)}${ed.length>30?"...":""}</a></li>`).join('') + '</ul>';
            }
            // other sections now contain objects with name/url
            return '<ul>' + arr.map(item => `<li><a href="${item.url}" target="_blank">${item.name || item.url}</a></li>`).join('') + '</ul>';
        }

        card.innerHTML = `
            <h3>${topic.name}</h3>
            <div class="resource-section">
                <h4>📺 Classes</h4>
                ${listSection(topic.classes)}
            </div>
            <div class="resource-section">
                <h4>📝 Blogs</h4>
                ${listSection(topic.blogs)}
            </div>
            <div class="resource-section">
                <h4>⏳ Long Contests</h4>
                ${listSection(topic.contests)}
            </div>
            <div class="resource-section">
                <h4>✍️ Editorials</h4>
                ${listSection(topic.editorials,'editorial')}
            </div>
        `;

        if (role === "admin") {
            const controls = document.createElement("div");
            controls.classList.add("admin-controls");
            controls.innerHTML = `
                <button class="secondary-btn" onclick="promptAdd(${idx}, 'classes')">Add Class</button>
                <button class="secondary-btn" onclick="promptAdd(${idx}, 'blogs')">Add Blog</button>
                <button class="secondary-btn" onclick="promptAdd(${idx}, 'contests')">Add Contest</button>
                <button class="secondary-btn" onclick="promptAdd(${idx}, 'editorials')">Add Editorial</button>
            `;
            card.appendChild(controls);
        }

        container.appendChild(card);
    });
}

// functions called by dynamic links
function promptAdd(topicIndex, section) {
    let name, url;
    if (section === 'editorials') {
        const text = prompt("Enter editorial text or link:");
        if (!text) return;
        topics[topicIndex].editorials.push(text);
        renderTopics();
        return;
    }

    name = prompt(`Enter ${section.slice(0,-1)} title:`);
    if (!name) return;
    url = prompt(`Enter ${section.slice(0,-1)} URL:`);
    if (!url) return;

    topics[topicIndex][section].push({ name, url });
    renderTopics();
}

function viewEditorial(tIdx, eIdx) {
    const ed = topics[tIdx].editorials[eIdx];
    alert(ed);
}

// add new topic (admin only)
document.getElementById("addTopicBtn")?.addEventListener("click", () => {
    const name = document.getElementById("topicName").value.trim();
    if (!name) {
        alert("Please provide a topic name");
        return;
    }
    topics.push({ name, classes: [], blogs: [], contests: [], editorials: [] });
    document.getElementById("topicName").value = "";
    renderTopics();
});

// initial render
renderTopics();
