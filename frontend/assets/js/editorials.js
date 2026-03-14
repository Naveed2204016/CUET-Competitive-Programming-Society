// Check if user is admin
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

const adminSection = document.getElementById("adminSection");
if (role === "admin") {
  adminSection.style.display = "block";
}

// Handle logout
const profileBtn = document.getElementById("profileBtn");
profileBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  localStorage.removeItem("id");
  window.location.href = "../index.html";
});

// Fetch and display all editorials
async function loadEditorials() {
  try {
    const response = await fetch("http://localhost:5001/api/editorials", {
      headers: { "content-type": "application/json" }
    });
    const data = await response.json();

    if (data.success) {
      displayEditorials(data.editorials);
    } else {
      document.getElementById("editorialsList").innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #9ca3af;">
          <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
          <p>Unable to load editorials.</p>
        </div>
      `;
    }
  } catch (err) {
    console.error(err);
    document.getElementById("editorialsList").innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #9ca3af;">
        <div style="font-size: 48px; margin-bottom: 15px;">❌</div>
        <p>Error loading editorials. Please try again later.</p>
      </div>
    `;
  }
}

// Display editorials
function displayEditorials(editorials) {
  const container = document.getElementById("editorialsList");
  container.innerHTML = "";

  if (editorials.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #9ca3af;">
        <div style="font-size: 48px; margin-bottom: 15px;">📚</div>
        <p style="font-size: 18px;">No editorials yet. Check back soon!</p>
      </div>
    `;
    return;
  }

  editorials.forEach(ed => {
    const truncatedContent = ed.Content.length > 200 ? ed.Content.substring(0, 200) + '...' : ed.Content;
    const difficultyClass = ed.Difficulty.toLowerCase();

    const card = document.createElement("div");
    card.className = "editorial-card";
    card.innerHTML = `
      <div class="editorial-header">
        <h3>${escapeHtml(ed.ProblemTitle)}</h3>
        <span class="difficulty ${difficultyClass}">${ed.Difficulty}</span>
      </div>
      <p class="contest">📌 ${escapeHtml(ed.ContestName)}</p>
      <p class="author">✍️ By ${escapeHtml(ed.Author.Username)}</p>
      <div class="editorial-content">
        ${escapeHtml(truncatedContent)}
      </div>
      <a href="${escapeHtml(ed.ProblemLink)}" target="_blank" class="problem-link">🔗 View Problem Solution</a>
      ${role === "admin" ? `
        <div class="admin-actions">
          <button class="edit-btn" onclick="editEditorial('${ed._id}')">✏️ Edit</button>
          <button class="delete-btn" onclick="deleteEditorial('${ed._id}')">🗑️ Delete</button>
        </div>
      ` : ""}
    `;
    container.appendChild(card);
  });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Create editorial (Admin)
const editorialForm = document.getElementById("editorialForm");
if (editorialForm) {
  editorialForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const problemTitle = document.getElementById("problemTitle").value;
    const contestName = document.getElementById("contestName").value;
    const problemLink = document.getElementById("problemLink").value;
    const content = document.getElementById("editorialContent").value;
    const difficulty = document.getElementById("difficulty").value;

    const submitBtn = editorialForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Publishing...";

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/editorials", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ProblemTitle: problemTitle,
          ContestName: contestName,
          ProblemLink: problemLink,
          Content: content,
          Difficulty: difficulty
        })
      });

      const data = await response.json();
      if (data.success) {
        alert("✅ Editorial published successfully!");
        editorialForm.reset();
        loadEditorials();
      } else {
        alert("❌ Failed to publish editorial: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("❌ Error publishing editorial: " + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Delete editorial
async function deleteEditorial(editorialId) {
  if (!confirm("⚠️ Are you sure you want to delete this editorial? This action cannot be undone.")) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5001/api/editorials/${editorialId}`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.success) {
      alert("✅ Editorial deleted successfully!");
      loadEditorials();
    } else {
      alert("❌ Failed to delete editorial: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    alert("❌ Error deleting editorial: " + err.message);
  }
}

// Edit editorial - Open modal with editorial data
async function editEditorial(editorialId) {
  try {
    // Fetch the editorial data
    const response = await fetch(`http://localhost:5001/api/editorials/${editorialId}`, {
      headers: { "content-type": "application/json" }
    });
    const data = await response.json();

    if (!data.success || !data.editorial) {
      alert("❌ Failed to load editorial for editing");
      return;
    }

    const ed = data.editorial;

    // Create modal
    const modal = document.createElement("div");
    modal.id = "editModal";
    modal.className = "edit-modal";
    modal.innerHTML = `
      <div class="edit-modal-content">
        <div class="edit-modal-header">
          <h2>✏️ Edit Editorial</h2>
          <button class="close-modal-btn" onclick="closeEditModal()">✕</button>
        </div>
        <form id="editForm">
          <input type="text" id="editProblemTitle" value="${escapeHtml(ed.ProblemTitle)}" placeholder="Problem Title" required>
          <input type="text" id="editContestName" value="${escapeHtml(ed.ContestName)}" placeholder="Contest Name" required>
          <input type="url" id="editProblemLink" value="${escapeHtml(ed.ProblemLink)}" placeholder="Problem Link" required>
          <textarea id="editContent" placeholder="Editorial Content" required>${escapeHtml(ed.Content)}</textarea>
          <select id="editDifficulty" required>
            <option value="Easy" ${ed.Difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
            <option value="Medium" ${ed.Difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Hard" ${ed.Difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
          </select>
          <div class="modal-actions">
            <button type="submit" class="primary-btn">💾 Save Changes</button>
            <button type="button" class="secondary-btn" onclick="closeEditModal()">Cancel</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById("editForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = document.querySelector("#editForm button[type='submit']");
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";

      try {
        const token = localStorage.getItem("token");
        const updateResponse = await fetch(`http://localhost:5001/api/editorials/${editorialId}`, {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            ProblemTitle: document.getElementById("editProblemTitle").value,
            ContestName: document.getElementById("editContestName").value,
            ProblemLink: document.getElementById("editProblemLink").value,
            Content: document.getElementById("editContent").value,
            Difficulty: document.getElementById("editDifficulty").value
          })
        });

        const updateData = await updateResponse.json();
        if (updateData.success) {
          alert("✅ Editorial updated successfully!");
          closeEditModal();
          loadEditorials();
        } else {
          alert("❌ Failed to update editorial: " + (updateData.message || "Unknown error"));
        }
      } catch (err) {
        alert("❌ Error updating editorial: " + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  } catch (err) {
    alert("❌ Error loading editorial: " + err.message);
  }
}

// Close edit modal
function closeEditModal() {
  const modal = document.getElementById("editModal");
  if (modal) {
    modal.remove();
  }
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  const modal = document.getElementById("editModal");
  if (modal && e.target === modal) {
    closeEditModal();
  }
});

// Load editorials on page load
window.addEventListener("load", loadEditorials);
