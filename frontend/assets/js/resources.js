const BASE = "http://localhost:5000/api/resources";

window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    let isAdmin = false;

    // Check admin access
    try {
        const adminRes = await fetch(`${BASE}/admin`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const adminData = await adminRes.json();
        if (adminData.success) {
            isAdmin = true;
            document.getElementById("adminTopicSection").style.display = "flex";
        }
    } catch (e) {
        // Not admin or not logged in — continue as member
    }

    // Load all resources
    await loadResources(isAdmin);

    // Add Topic button (admin only)
    document.getElementById("addTopicBtn").addEventListener("click", async () => {
        const name = document.getElementById("topicName").value.trim();
        if (!name) { alert("Please enter a topic name."); return; }
        try {
            const res = await fetch(`${BASE}/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, classes: [], blogs: [], contests: [], editorials: [] })
            });
            const data = await res.json();
            if (data.success) {
                document.getElementById("topicName").value = "";
                document.getElementById("topicsList").appendChild(buildCard(data.resource, true));
            } else {
                alert(data.message || "Failed to add topic.");
            }
        } catch (err) {
            console.error(err);
            alert("Error adding topic.");
        }
    });

    // Close any open 3-dot dropdowns when clicking elsewhere
    document.addEventListener("click", () => {
        document.querySelectorAll(".res-dropdown.open").forEach(dd => dd.classList.remove("open"));
    });

    // Editorial link click — delegated handler
    document.addEventListener("click", (e) => {
        const link = e.target.closest(".editorial-link");
        if (link) {
            e.preventDefault();
            showEditorialModal(decodeURIComponent(link.dataset.text));
        }
    });
});

// ── Load all resource cards ──────────────────────────────────────────────────

async function loadResources(isAdmin) {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${BASE}/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            const container = document.getElementById("topicsList");
            container.innerHTML = "";
            data.resources.forEach(resource => container.appendChild(buildCard(resource, isAdmin)));
        } else {
            alert(data.message || "Failed to load resources.");
        }
    } catch (err) {
        console.error(err);
        alert("Error loading resources.");
    }
}

// ── Build a single topic card ────────────────────────────────────────────────

function buildCard(resource, isAdmin) {
    const card = document.createElement("div");
    card.classList.add("resource-topic");
    card.dataset.id = resource._id;

    // Header: topic name + 3-dot menu (admin only)
    const header = document.createElement("div");
    header.classList.add("resource-card-header");

    const title = document.createElement("h3");
    title.textContent = resource.name;
    header.appendChild(title);

    if (isAdmin) {
        const menu = document.createElement("div");
        menu.classList.add("res-menu");
        menu.innerHTML = `
            <button class="res-menu-btn" title="Options">&#8942;</button>
            <div class="res-dropdown">
                <button class="res-delete-btn">Delete Topic</button>
            </div>
        `;

        // Toggle dropdown
        menu.querySelector(".res-menu-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            // Close all other open dropdowns first
            document.querySelectorAll(".res-dropdown.open").forEach(dd => {
                if (dd !== menu.querySelector(".res-dropdown")) dd.classList.remove("open");
            });
            menu.querySelector(".res-dropdown").classList.toggle("open");
        });

        // Delete topic
        menu.querySelector(".res-delete-btn").addEventListener("click", async () => {
            if (!confirm(`Delete topic "${resource.name}"? This cannot be undone.`)) return;
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${BASE}/${resource._id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    card.remove();
                } else {
                    alert(data.message || "Failed to delete topic.");
                }
            } catch (err) {
                console.error(err);
                alert("Error deleting topic.");
            }
        });

        header.appendChild(menu);
    }

    card.appendChild(header);

    // Content sections
    const body = document.createElement("div");
    body.innerHTML = `
        <div class="resource-section">
            <h4>📺 Classes</h4>
            ${listSection(resource.classes)}
        </div>
        <div class="resource-section">
            <h4>📝 Blogs</h4>
            ${listSection(resource.blogs)}
        </div>
        <div class="resource-section">
            <h4>⏳ Long Contests</h4>
            ${listSection(resource.contests)}
        </div>
        <div class="resource-section">
            <h4>✍️ Editorials</h4>
            ${listSection(resource.editorials, "editorial")}
        </div>
    `;
    card.appendChild(body);

    // Admin action buttons
    if (isAdmin) {
        const controls = document.createElement("div");
        controls.classList.add("admin-controls");
        [
            { label: "Add Class",     field: "classes"    },
            { label: "Add Blog",      field: "blogs"      },
            { label: "Add Contest",   field: "contests"   },
            { label: "Add Editorial", field: "editorials" }
        ].forEach(({ label, field }) => {
            const btn = document.createElement("button");
            btn.className = "secondary-btn";
            btn.textContent = label;
            btn.addEventListener("click", () => openAddModal(resource._id, field, card));
            controls.appendChild(btn);
        });
        card.appendChild(controls);
    }

    return card;
}

// ── Render a resource sub-section list ──────────────────────────────────────

function listSection(arr, type) {
    if (!arr || arr.length === 0) {
        return '<p class="empty">Not uploaded yet</p>';
    }
    if (type === "editorial") {
        return "<ul>" + arr.map(ed =>
            `<li><a href="#" class="editorial-link" data-text="${encodeURIComponent(ed)}">${ed.length > 50 ? ed.substring(0, 50) + "…" : ed}</a></li>`
        ).join("") + "</ul>";
    }
    return "<ul>" + arr.map(item =>
        `<li><a href="${item.url}" target="_blank">${item.name || item.url}</a></li>`
    ).join("") + "</ul>";
}

// ── Add-item modal ───────────────────────────────────────────────────────────

function openAddModal(resourceId, field, card) {
    const isEditorial = field === "editorials";
    const modal = document.getElementById("addItemModal");

    const fieldLabels = { classes: "Class", blogs: "Blog", contests: "Contest" };
    document.getElementById("modalTitle").textContent =
        isEditorial ? "Add Editorial" : `Add ${fieldLabels[field]}`;

    document.getElementById("itemNameGroup").style.display  = isEditorial ? "none" : "flex";
    document.getElementById("itemUrlGroup").style.display   = isEditorial ? "none" : "flex";
    document.getElementById("editorialGroup").style.display = isEditorial ? "flex" : "none";

    document.getElementById("itemName").value      = "";
    document.getElementById("itemUrl").value       = "";
    document.getElementById("editorialText").value = "";

    modal.classList.add("open");

    // Replace form to drop any previous submit listener
    const oldForm = document.getElementById("addItemForm");
    const newForm = oldForm.cloneNode(true);
    oldForm.parentNode.replaceChild(newForm, oldForm);

    document.getElementById("modalCancelBtn").onclick = () => modal.classList.remove("open");

    newForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        let item;

        if (isEditorial) {
            item = document.getElementById("editorialText").value.trim();
            if (!item) return;
        } else {
            const name = document.getElementById("itemName").value.trim();
            const url  = document.getElementById("itemUrl").value.trim();
            if (!name || !url) { alert("Please fill in both Name and URL."); return; }
            item = { name, url };
        }

        try {
            const res = await fetch(`${BASE}/${resourceId}/add`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ field, item })
            });
            const data = await res.json();
            if (data.success) {
                modal.classList.remove("open");
                // Swap out the old card DOM node with the refreshed one
                const newCard = buildCard(data.resource, true);
                card.parentNode.replaceChild(newCard, card);
            } else {
                alert(data.message || "Failed to add item.");
            }
        } catch (err) {
            console.error(err);
            alert("Error adding item.");
        }
    });
}

// ── Editorial view modal ─────────────────────────────────────────────────────

function showEditorialModal(text) {
    const modal = document.getElementById("editorialModal");
    document.getElementById("editorialContent").textContent = text;
    modal.classList.add("open");
    document.getElementById("editorialCloseBtn").onclick = () => modal.classList.remove("open");
}



/*let topics = [
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
];*/
