let isAdmin = false;

window.addEventListener("load", async () => {
    try {
        const token = localStorage.getItem("token");

        const response1 = await fetch("http://localhost:5000/api/announcements/post", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data1 = await response1.json();
        if (data1.success) {
            isAdmin = true;
            document.getElementById("adminSection").style.display = "flex";
        } else {
            document.getElementById("adminSection").style.display = "none";
        }

        const response = await fetch("http://localhost:5000/api/announcements/", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            const announcements = data.announcements;
            for (const ann of announcements) {
                const card = buildCard(ann.Title, ann.Content, ann.Date);
                document.getElementById("announcementList").prepend(card);
            }
        } else {
            window.location.href = "../index.html";
            alert(data.message || "Failed to load announcements.");
        }
    } catch (err) {
        console.error("Error fetching announcements:", err);
        alert("An error occurred while fetching announcements.");
    }
});

function buildCard(title, content, dateVal) {
    const card = document.createElement("div");
    card.classList.add("announcement-card");
    card.dataset.title = title;
    const date = new Date(dateVal).toDateString();

    const menuHTML = isAdmin ? `
        <div class="ann-menu">
            <button class="ann-menu-btn">&#8942;</button>
            <div class="ann-dropdown">
                <button class="ann-edit-btn">Edit</button>
                <button class="ann-delete-btn">Delete</button>
            </div>
        </div>` : "";

    card.innerHTML = `
        <div class="announcement-header">
            <h3>${title}</h3>
            <div class="announcement-meta">
                <span class="date">${date}</span>
                ${menuHTML}
            </div>
        </div>
        <p>${content}</p>`;

    if (isAdmin) {
        attachMenuListeners(card);
    }
    return card;
}

function attachMenuListeners(card) {
    const menuBtn = card.querySelector(".ann-menu-btn");
    const dropdown = card.querySelector(".ann-dropdown");
    const editBtn = card.querySelector(".ann-edit-btn");
    const deleteBtn = card.querySelector(".ann-delete-btn");

    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".ann-dropdown.open").forEach(d => {
            if (d !== dropdown) d.classList.remove("open");
        });
        dropdown.classList.toggle("open");
    });

    deleteBtn.addEventListener("click", async () => {
        dropdown.classList.remove("open");
        const originalTitle = card.dataset.title;
        if (!confirm(`Delete announcement "${originalTitle}"?`)) return;

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:5000/api/announcements/${encodeURIComponent(originalTitle)}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                card.remove();
            } else {
                alert(data.message || "Failed to delete announcement.");
            }
        } catch (err) {
            console.error("Error deleting announcement:", err);
            alert("An error occurred while deleting.");
        }
    });

    editBtn.addEventListener("click", () => {
        dropdown.classList.remove("open");
        enterEditMode(card);
    });
}

function enterEditMode(card) {
    const h3 = card.querySelector("h3");
    const p = card.querySelector("p");
    const originalTitle = card.dataset.title;

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.classList.add("edit-title");
    titleInput.value = h3.textContent;
    h3.replaceWith(titleInput);

    const contentTextarea = document.createElement("textarea");
    contentTextarea.classList.add("edit-content");
    contentTextarea.value = p.textContent;
    p.replaceWith(contentTextarea);

    titleInput.focus();

    const saveEdit = async () => {
        const newTitle = titleInput.value.trim();
        const newContent = contentTextarea.value.trim();
        if (!newTitle || !newContent) {
            alert("Title and content cannot be empty.");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:5000/api/announcements/${encodeURIComponent(originalTitle)}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ Title: newTitle, Content: newContent })
            });
            const data = await response.json();
            if (data.success) {
                card.dataset.title = newTitle;

                const newH3 = document.createElement("h3");
                newH3.textContent = newTitle;
                titleInput.replaceWith(newH3);

                const newP = document.createElement("p");
                newP.textContent = newContent;
                contentTextarea.replaceWith(newP);
            } else {
                alert(data.message || "Failed to update announcement.");
            }
        } catch (err) {
            console.error("Error updating announcement:", err);
            alert("An error occurred while updating.");
        }
    };

    titleInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            saveEdit();
        }
    });

    contentTextarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            saveEdit();
        }
    });
}

document.addEventListener("click", () => {
    document.querySelectorAll(".ann-dropdown.open").forEach(d => d.classList.remove("open"));
});

document.getElementById("postBtn")?.addEventListener("click", async () => {
    try {
        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;
        const token = localStorage.getItem("token");

        if (!title || !content) {
            alert("Please fill all fields");
            return;
        }

        const today = new Date();

        const response = await fetch("http://localhost:5000/api/announcements/", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ Title: title, Content: content, Date: today })
        });

        const data = await response.json();
        if (!data.success) {
            alert(data.message || "Failed to post announcement.");
            return;
        }

        const card = buildCard(title, content, today);
        document.getElementById("announcementList").prepend(card);
        document.getElementById("title").value = "";
        document.getElementById("content").value = "";
    } catch (err) {
        console.error("Error posting announcement:", err);
    }
});