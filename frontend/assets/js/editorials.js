let isAdmin = false;
document.addEventListener("DOMContentLoaded", async () =>{
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to access the editorials page.");
    window.location.href = "../pages/login.html";
    return;
  }

  const response = await fetch("http://localhost:5000/api/editorials/post",
    {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    }
  );
  const data = await response.json();
  if(data.success && data.message) {
    isAdmin = true;
    document.getElementById("adminSection").style.display = "block";
  }
  else
  {
    console.log(data.message);
    document.getElementById("adminSection").style.display = "none";
  }

  const response2 = await fetch("http://localhost:5000/api/editorials/",
    {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    }
  );

const data2 = await response2.json();
  if(data2.success)  {
    const editorialsContainer = document.getElementById("editorialsList");
    if(data2.editorials.length === 0) {
    editorialsContainer.innerHTML = "<p>🚧 No editorials available yet. Stay tuned and check back soon!</p>";
    } else {
      data2.editorials.forEach(editorial => {
      const menuHTML = isAdmin
        ? `
          <div class="ann-menu">
            <button class="ann-menu-btn" title="Editorial options">&#8942;</button>
            <div class="ann-dropdown">
              <button class="ann-edit-btn">Edit</button>
              <button class="ann-delete-btn">Delete</button>
            </div>
          </div>
        `
        : "";

      const card = document.createElement("div");
      card.classList.add("editorial-card");
      card.dataset.id = editorial._id;
      card.dataset.name = editorial.contestName;
      card.innerHTML = `
        <div class="editorial-header">
          <h3>${editorial.contestName}</h3>
          ${menuHTML}
        </div>
        <div class="editorial-content">
          <p>${editorial.editorialContent}</p>
        </div>
      `;
      
      if(isAdmin) {
        attachMenuListeners(card);
      }
      editorialsContainer.appendChild(card);
      });
    }
  }

  document.addEventListener("click", () => {
    document.querySelectorAll(".ann-dropdown.open").forEach((d) => d.classList.remove("open"));
  });
});


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
        const contestName = card.dataset.name;
        if (!confirm(`Delete contest "${contestName}"?`)) return;

        const token = localStorage.getItem("token");
        try {
            const id = card.dataset.id;
            const response = await fetch(`http://localhost:5000/api/editorials/${encodeURIComponent(id)}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                card.remove();
            } else {
                alert(data.message || "Failed to delete editorial.");
            }
        } catch (err) {
            console.error("Error deleting editorial:", err);
            alert("An error occurred while deleting.");
        }
    });

    editBtn.addEventListener("click", () => {
        dropdown.classList.remove("open");
        enterEditMode(card);
    });
}

function enterEditMode(card) {
  const titleEl = card.querySelector(".editorial-header h3");
  const contentEl = card.querySelector(".editorial-content p");

  if (!titleEl || !contentEl) return;
  if (card.dataset.editing === "true") return;

  const originalName = card.dataset.name || titleEl.textContent.trim();

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.classList.add("edit-title");
  nameInput.value = titleEl.textContent.trim();

  const contentTextarea = document.createElement("textarea");
  contentTextarea.classList.add("edit-content");
  contentTextarea.value = contentEl.textContent.trim();

  titleEl.replaceWith(nameInput);
  contentEl.replaceWith(contentTextarea);

  card.dataset.editing = "true";
  nameInput.focus();

  const saveEdit = async () => {
    const newName = nameInput.value.trim();
    const newContent = contentTextarea.value.trim();

    if (!newName || !newContent) {
      alert("Contest name and editorial content cannot be empty.");
      return;
    }

    const token = localStorage.getItem("token");
    const id = card.dataset.id;

    try {
      const response = await fetch(`http://localhost:5000/api/editorials/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          contestName: newName,
          editorialContent: newContent
        })
      });

      const data = await response.json();
      if (!data.success) {
        alert(data.message || "Failed to update editorial.");
        return;
      }

      card.dataset.name = newName;

      const newTitleEl = document.createElement("h3");
      newTitleEl.textContent = newName;
      nameInput.replaceWith(newTitleEl);

      const newContentEl = document.createElement("p");
      newContentEl.textContent = newContent;
      contentTextarea.replaceWith(newContentEl);

      delete card.dataset.editing;
    } catch (err) {
      console.error("Error updating editorial:", err);
      alert("An error occurred while updating editorial.");
    }
  };

  nameInput.addEventListener("keydown", (e) => {
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


document.getElementById("publishEditorialBtn")?.addEventListener("click", async (event) => {
  event.preventDefault();
  await publishEditorial();
});

document.getElementById("editorialForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await publishEditorial();
});

async function publishEditorial() {
  const contestNameInput = document.getElementById("contestName");
  const editorialContentInput = document.getElementById("editorialContent");
  const editorialsContainer = document.getElementById("editorialsList");

  if (!contestNameInput || !editorialContentInput || !editorialsContainer) return;

  const contestName = contestNameInput.value.trim();
  const editorialContent = editorialContentInput.value.trim();

  if (!contestName || !editorialContent) {
    alert("Please fill in both contest name and editorial content.");
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:5000/api/editorials/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        contestName,
        editorialContent
      })
    });

    const data = await response.json();
    if (!data.success) {
      alert(data.message || "Failed to publish editorial.");
      return;
    }

    // Fetch latest list to get the created editorial id, then render only the newest card.
    const refreshResponse = await fetch("http://localhost:5000/api/editorials/", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    const refreshData = await refreshResponse.json();
    if (!refreshData.success || !Array.isArray(refreshData.editorials) || !refreshData.editorials.length) {
      alert("Editorial published, but failed to refresh list.");
      return;
    }

    const latest = refreshData.editorials[refreshData.editorials.length - 1];
    const menuHTML = isAdmin
      ? `
        <div class="ann-menu">
        <button class="ann-menu-btn" title="Editorial options">&#8942;</button>
        <div class="ann-dropdown">
          <button class="ann-edit-btn">Edit</button>
          <button class="ann-delete-btn">Delete</button>
        </div>
        </div>
      `
      : "";

    const card = document.createElement("div");
    card.classList.add("editorial-card");
    card.dataset.id = latest._id;
    card.dataset.name = latest.contestName;
    card.innerHTML = `
      <div class="editorial-header">
        <h3>${latest.contestName}</h3>
        ${menuHTML}
      </div>
      <div class="editorial-content">
        <p>${latest.editorialContent}</p>
      </div>
    `;

    const emptyMessage = editorialsContainer.querySelector("p");
    if (emptyMessage && emptyMessage.textContent.includes("No editorials available yet")) {
      editorialsContainer.innerHTML = "";
    }

    if (isAdmin) {
      attachMenuListeners(card);
    }

    editorialsContainer.prepend(card);
    contestNameInput.value = "";
    editorialContentInput.value = "";
  } catch (err) {
    console.error("Error publishing editorial:", err);
    alert("An error occurred while publishing editorial.");
  }
}












