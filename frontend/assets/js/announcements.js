// Simulated role check (temporary frontend logic)
const role = localStorage.getItem("role");

// Show admin section only if admin
if (role === "admin") {
    document.getElementById("adminSection").style.display = "flex";
}

// Fake post functionality (frontend only demo)
document.getElementById("postBtn")?.addEventListener("click", () => {

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    if (!title || !content) {
        alert("Please fill all fields");
        return;
    }

    const card = document.createElement("div");
    card.classList.add("announcement-card");

    const today = new Date().toDateString();

    card.innerHTML = `
        <div class="announcement-header">
            <h3>${title}</h3>
            <span class="date">${today}</span>
        </div>
        <p>${content}</p>
    `;

    document.getElementById("announcementList").prepend(card);

    document.getElementById("title").value = "";
    document.getElementById("content").value = "";
});