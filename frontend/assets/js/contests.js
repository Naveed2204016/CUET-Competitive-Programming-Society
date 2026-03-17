let isadmin=false;

window.addEventListener("load", async () => {
    try
    {
        const token = localStorage.getItem("token");
        const response1 = await fetch("http://localhost:5000/api/contests/admin",
            {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
        const data1 = await response1.json();
        if (data1.success)
        {
            isadmin = true;
            document.getElementById("adminSection").style.display = "flex";
        }
        else
        {
            document.getElementById("adminSection").style.display = "none";
        }

        const response = await fetch("http://localhost:5000/api/contests/", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (!data.success) {
            alert(data.message || "Failed to load contests.");
            return;
        }
        const contests = data.contests;
        for(const contest of contests)
        {
            const card = buildCard(contest.name, contest.date, contest.contestlink, contest._id);
            document.getElementById("contestList").appendChild(card);
        }

    }catch(err)
    {
        console.error("Error fetching contests:", err);
        alert("An error occurred while fetching contests.");
    }
});


function buildCard(name, dateVal, contestlink, contestId) {
    const card = document.createElement("div");
    card.classList.add("announcement-card");
    card.dataset.name = name;
    card.dataset.contestId = contestId;
    const date = new Date(dateVal).toDateString();

    const menuHTML = isadmin ? `
        <div class="ann-menu">
            <button class="ann-menu-btn">&#8942;</button>
            <div class="ann-dropdown">
                <button class="ann-edit-btn">Edit</button>
                <button class="ann-delete-btn">Delete</button>
            </div>
        </div>` : "";

    card.innerHTML = `
        <div class="announcement-header contest-header-style">
            <h3><a href="${contestlink}" target="_blank">${name}</a></h3>
            <div class="announcement-meta">
                <span class="date">${date}</span>
                ${menuHTML}
            </div>
        </div>
        `;

    if (isadmin) {
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
        const originalname = card.dataset.name;
        if (!confirm(`Delete contest "${originalname}"?`)) return;

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:5000/api/contests/${encodeURIComponent(card.dataset.contestId)}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                card.remove();
            } else {
                alert(data.message || "Failed to delete contest.");
            }
        } catch (err) {
            console.error("Error deleting contest:", err);
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
    const dateSpan = card.querySelector(".date");
    const anchor = h3?.querySelector("a");
    if (!h3 || !dateSpan) return;

    const currentName = anchor ? anchor.textContent.trim() : h3.textContent.trim();
    const currentLink = anchor ? anchor.getAttribute("href") || "" : "";
    const parsedDate = new Date(dateSpan.textContent);
    const dateForInput = Number.isNaN(parsedDate.getTime())
        ? new Date().toISOString().slice(0, 10)
        : parsedDate.toISOString().slice(0, 10);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.classList.add("edit-title");
    nameInput.value = currentName;

    const linkInput = document.createElement("input");
    linkInput.type = "url";
    linkInput.classList.add("edit-title");
    linkInput.value = currentLink;
    linkInput.placeholder = "Contest link";
    linkInput.style.marginTop = "8px";

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.classList.add("edit-title");
    dateInput.value = dateForInput;
    dateInput.style.width = "140px";

    h3.replaceWith(nameInput);
    nameInput.insertAdjacentElement("afterend", linkInput);
    dateSpan.replaceWith(dateInput);
    nameInput.focus();

    const saveEdit = async () => {
        const newName = nameInput.value.trim();
        const newLink = linkInput.value.trim();
        const newDate = dateInput.value;

        if (!newName || !newLink || !newDate) {
            alert("Name, link and date cannot be empty.");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`http://localhost:5000/api/contests/${encodeURIComponent(card.dataset.contestId)}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: newName,
                    date: newDate,
                    contestlink: newLink
                })
            });
            const data = await response.json();
            if (data.success) {
                card.dataset.name = newName;

                const newH3 = document.createElement("h3");
                const newA = document.createElement("a");
                newA.href = newLink;
                newA.target = "_blank";
                newA.textContent = newName;
                newH3.appendChild(newA);

                const newDateSpan = document.createElement("span");
                newDateSpan.classList.add("date");
                newDateSpan.textContent = new Date(newDate).toDateString();

                nameInput.replaceWith(newH3);
                linkInput.remove();
                dateInput.replaceWith(newDateSpan);
            } else {
                alert(data.message || "Failed to update contest.");
            }
        } catch (err) {
            console.error("Error updating contest:", err);
            alert("An error occurred while updating.");
        }
    };

    [nameInput, linkInput, dateInput].forEach((input) => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                saveEdit();
            }
        });
    });
}

document.addEventListener("click", () => {
    document.querySelectorAll(".ann-dropdown.open").forEach(d => d.classList.remove("open"));
});


document.addEventListener("click", () => {
    document.querySelectorAll(".ann-dropdown.open").forEach(d => d.classList.remove("open"));
});

document.getElementById("createContestBtn")?.addEventListener("click", async () => {
    try {
        const name = document.getElementById("contestName").value;
        const link = document.getElementById("contestlink").value;
        const date = document.getElementById("contestDate").value;
        const token = localStorage.getItem("token");

        if (!name || !link || !date) {
            alert("Please fill all fields");
            return;
        }

        const today = new Date();

        const response = await fetch("http://localhost:5000/api/contests/", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, date ,contestlink: link})
        });

        const data = await response.json();
        if (!data.success) {
            alert(data.message || "Failed to post contest.");
            return;
        }

        const card = buildCard(name, link, date);
        document.getElementById("contestList").prepend(card);
        document.getElementById("contestName").value = "";
        document.getElementById("contestlink").value = "";
        document.getElementById("contestDate").value = "";
    } catch (err) {
        console.error("Error posting contest:", err);
    }
});



