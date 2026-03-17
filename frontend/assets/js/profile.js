const PROFILE_API = "http://localhost:5000/api/profile";
const DISCUSSION_API = "http://localhost:5000/api/discussion";

const token = localStorage.getItem("token");

const profileContentEl = document.querySelector(".profile-content");
const profileBadge = document.querySelector(".profile-badge");
const postsContainer = document.getElementById("postsContainer");
const logoutBtn = document.getElementById("logoutBtn");
const profileActions = document.querySelector(".profile-actions");
const profilePrimaryBtn = profileActions?.querySelector(".primary-btn");
const profileSecondaryBtn = profileActions?.querySelector(".secondary-btn");

let currentProfile = null;
let profileEditMode = false;
let posts = [];
let openComments = {};

document.addEventListener("DOMContentLoaded", initPage);

async function initPage() {
    if (!token) {
        alert("Please log in to view your profile.");
        window.location.href = "./login.html";
        return;
    }

    setupProfileBadge();
    bindStaticEvents();

    try {
        await Promise.all([loadProfile(), loadMyDiscussions()]);
    } catch (error) {
        console.error("Error loading profile page:", error);
        alert(error.message || "An error occurred while loading your profile page.");
    }
}

function setupProfileBadge() {
    if (!profileBadge) return;

    const username = (localStorage.getItem("username") || "Member").trim();
    const role = (localStorage.getItem("role") || "member").trim().toLowerCase();
    profileBadge.textContent = `${username} • ${role}`;
}

function bindStaticEvents() {
    if (logoutBtn) {
        logoutBtn.addEventListener("click", onLogout);
    }

    if (profilePrimaryBtn) {
        profilePrimaryBtn.addEventListener("click", onEditButtonClick);
    }

    if (profileSecondaryBtn) {
        profileSecondaryBtn.addEventListener("click", onSecondaryButtonClick);
    }

    if (postsContainer) {
        postsContainer.addEventListener("click", onPostsClick);
        postsContainer.addEventListener("dblclick", onCommentDoubleClick);
    }

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".discussion-menu")) {
            closeAllMenus();
        }

        if (!event.target.closest(".discussion-comment")) {
            postsContainer
                ?.querySelectorAll(".discussion-comment.show-delete")
                .forEach((el) => el.classList.remove("show-delete"));
        }
    });
}

async function loadProfile() {
    const data = await apiRequest(`${PROFILE_API}/profiledetails`, { method: "GET" });

    if (!data?.success || !data?.user) {
        throw new Error(data?.message || "Failed to load profile details.");
    }

    currentProfile = data.user;
    renderProfile();
}

function renderProfile() {
    if (!profileContentEl || !currentProfile) return;

    const user = currentProfile;
    const username = user.Username || "";
    const email = user.Email || "";
    const facultyId = user.ID || "";
    const cfHandle = user.CfHandle || "";
    const role = user.Role || "member";

    profileContentEl.innerHTML = `
        <div class="profile-grid">
            <div class="profile-field">
                <label for="profileUsername">Username</label>
                <input id="profileUsername" type="text" value="${escapeHtml(username)}" ${
                    profileEditMode ? "" : "disabled"
                }>
            </div>

            <div class="profile-field">
                <label for="profileEmail">Email</label>
                <input id="profileEmail" type="email" value="${escapeHtml(email)}" ${
                    profileEditMode ? "" : "disabled"
                }>
            </div>

            <div class="profile-field">
                <label for="profileFacultyId">Faculty ID</label>
                <input id="profileFacultyId" type="text" value="${escapeHtml(facultyId)}" ${
                    profileEditMode ? "" : "disabled"
                }>
            </div>

            <div class="profile-field">
                <label for="profileHandle">Codeforces Handle</label>
                <input id="profileHandle" type="text" value="${escapeHtml(cfHandle)}" ${
                    profileEditMode ? "" : "disabled"
                }>
            </div>

            <div class="profile-field profile-field-readonly">
                <label for="profileRole">Role</label>
                <input id="profileRole" type="text" value="${escapeHtml(role)}" disabled>
            </div>
        </div>
    `;

    if (profilePrimaryBtn && profileSecondaryBtn) {
        profilePrimaryBtn.textContent = profileEditMode ? "Save Changes" : "Edit Profile";
        profileSecondaryBtn.textContent = profileEditMode ? "Cancel" : "Change Password";
    }
}

async function onEditButtonClick() {
    if (!profileEditMode) {
        profileEditMode = true;
        renderProfile();
        return;
    }

    const payload = {
        Username: document.getElementById("profileUsername")?.value.trim() || "",
        Email: document.getElementById("profileEmail")?.value.trim() || "",
        ID: document.getElementById("profileFacultyId")?.value.trim() || "",
        CfHandle: document.getElementById("profileHandle")?.value.trim() || "",
    };

    if (!payload.Username || !payload.Email || !payload.ID || !payload.CfHandle) {
        alert("All profile fields are required.");
        return;
    }

    try {
        const data = await apiRequest(`${PROFILE_API}/profileupdate`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });

        if (!data.success) {
            throw new Error(data.message || "Failed to update profile.");
        }

        localStorage.setItem("username", payload.Username);
        localStorage.setItem("id", payload.ID);
        setupProfileBadge();

        profileEditMode = false;
        await loadProfile();
        alert("Profile updated successfully.");
    } catch (error) {
        alert(error.message || "Failed to update profile.");
    }
}

function onSecondaryButtonClick() {
    if (profileEditMode) {
        profileEditMode = false;
        renderProfile();
        return;
    }

    openPasswordModal();
}

function openPasswordModal() {
    const existing = document.getElementById("passwordModalOverlay");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "passwordModalOverlay";
    modal.className = "modal-overlay open";
    modal.innerHTML = `
        <div class="modal-box password-modal-box" role="dialog" aria-modal="true" aria-labelledby="passwordModalTitle">
            <h3 id="passwordModalTitle">Change Password</h3>
            <p class="password-modal-subtitle">Enter your current password and choose a new one.</p>

            <form id="changePasswordForm">
                <div class="modal-field">
                    <label for="currentPassword">Current Password</label>
                    <input id="currentPassword" type="password" required minlength="4">
                </div>

                <div class="modal-field">
                    <label for="newPassword">New Password</label>
                    <input id="newPassword" type="password" required minlength="4">
                </div>

                <div class="modal-field">
                    <label for="confirmPassword">Confirm New Password</label>
                    <input id="confirmPassword" type="password" required minlength="4">
                </div>

                <div class="modal-actions">
                    <button type="button" class="secondary-btn" id="cancelPasswordBtn">Cancel</button>
                    <button type="submit" class="primary-btn" id="confirmPasswordBtn">Confirm</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();

    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });

    const form = modal.querySelector("#changePasswordForm");
    const cancelBtn = modal.querySelector("#cancelPasswordBtn");

    cancelBtn?.addEventListener("click", closeModal);

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const currentPassword = modal
            .querySelector("#currentPassword")
            ?.value.trim();
        const newPassword = modal.querySelector("#newPassword")?.value.trim();
        const confirmPassword = modal
            .querySelector("#confirmPassword")
            ?.value.trim();

        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill all password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New password and confirm password do not match.");
            return;
        }

        try {
            const data = await apiRequest(`${PROFILE_API}/changepassword`, {
                method: "PUT",
                body: JSON.stringify({
                    CurrentPassword: currentPassword,
                    NewPassword: newPassword,
                }),
            });

            if (!data.success) {
                throw new Error(data.message || "Failed to update password.");
            }

            alert("Password changed successfully.");
            closeModal();
        } catch (error) {
            alert(error.message || "Failed to update password.");
        }
    });

    const onEsc = (event) => {
        if (event.key === "Escape") {
            closeModal();
            document.removeEventListener("keydown", onEsc);
        }
    };

    document.addEventListener("keydown", onEsc);
}

async function loadMyDiscussions() {
    try {
        const data = await apiRequest(`${PROFILE_API}/mydiscussions`, {
            method: "GET",
        });

        if (!data?.success) {
            throw new Error(data?.message || "Failed to load your discussions.");
        }

        posts = normalizePosts(data.discussions || []);

        // Fallback: if comments came as ids due to backend populate typo, enrich from full feed.
        if (posts.some((post) => post.comments.some((comment) => !comment.loaded))) {
            await enrichMissingComments();
        }

        renderPosts();
    } catch (error) {
        console.error("Failed to load my discussions:", error);
        postsContainer.innerHTML = `
            <div class="discussion-empty">
                <h3>Unable to load your discussions</h3>
                <p>${escapeHtml(error.message || "Please try again.")}</p>
            </div>
        `;
    }
}

async function enrichMissingComments() {
    const feedData = await apiRequest(DISCUSSION_API, { method: "GET" });
    const normalizedFeed = normalizePosts(feedData?.discussions || []);
    const mapById = new Map(normalizedFeed.map((post) => [post.id, post]));

    posts = posts.map((post) => {
        const source = mapById.get(post.id);
        return source ? { ...post, comments: source.comments } : post;
    });
}

function normalizePosts(items) {
    return items
        .map((item) => {
            const postId = String(item._id || item.id || Date.now() + Math.random());
            const authorObj = item.DID && typeof item.DID === "object" ? item.DID : null;

            return {
                id: postId,
                title: item.Title || deriveTitle(item.Content || ""),
                content: item.Content || "",
                author: authorObj?.Username || item.author || localStorage.getItem("username") || "Member",
                authorId: String(authorObj?._id || item.DID || item.authorId || ""),
                role: authorObj?.Role ? String(authorObj.Role).toLowerCase() : (localStorage.getItem("role") || "member"),
                createdAt: item.date || item.Date || new Date().toISOString(),
                comments: normalizeComments(item.comments || []),
            };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function normalizeComments(items) {
    return items.map((commentItem) => {
        if (commentItem && typeof commentItem === "object") {
            return {
                id: String(commentItem._id || commentItem.id || Date.now() + Math.random()),
                username: commentItem.username || "Member",
                content: commentItem.content || "",
                loaded: true,
            };
        }

        return {
            id: String(commentItem),
            username: "Unknown",
            content: "Comment data is not available in this response.",
            loaded: false,
        };
    });
}

function renderPosts() {
    if (!postsContainer) return;

    if (!posts.length) {
        postsContainer.innerHTML = `
            <div class="discussion-empty">
                <h3>You have not posted yet</h3>
                <p>Start a discussion from the community page and your posts will appear here.</p>
            </div>
        `;
        return;
    }

    postsContainer.innerHTML = posts.map(renderPostCard).join("");
}

function renderPostCard(post) {
    const commentsVisible = Boolean(openComments[post.id]);

    return `
        <article class="discussion-post" data-post-id="${post.id}">
            <div class="discussion-card-header">
                <div>
                    <div class="discussion-post-meta">
                        <span class="post-author">${escapeHtml(post.author)}</span>
                        <span class="discussion-card-tag">${escapeHtml(post.role)}</span>
                        <span class="discussion-card-subtitle">${formatDate(post.createdAt)}</span>
                    </div>
                    <p class="discussion-card-subtitle">${escapeHtml(post.title)}</p>
                </div>
                ${renderMenu()}
            </div>

            <div class="discussion-post-body">
                <p class="post-content">${escapeHtml(post.content)}</p>
            </div>

            <div class="discussion-card-footer">
                <div class="discussion-stats">
                    <span class="discussion-stat-pill">💬 ${post.comments.length} ${
                        post.comments.length === 1 ? "comment" : "comments"
                    }</span>
                </div>
                <div class="post-controls">
                    <button class="discussion-action-btn" data-action="toggle-comments">
                        ${commentsVisible ? "Hide comments" : "Comment"}
                    </button>
                </div>
            </div>

            <section class="discussion-comments-wrap" ${commentsVisible ? "" : "hidden"}>
                <div class="discussion-comments-list">${renderComments(post)}</div>
                <div class="discussion-comment-composer">
                    <label class="discussion-field-label" for="commentInput-${post.id}">Add a comment</label>
                    <textarea id="commentInput-${post.id}" placeholder="Write your comment..."></textarea>
                    <div class="discussion-comment-composer-actions">
                        <span class="comment-delete-hint">Double-click your comment to show delete</span>
                        <button class="primary-btn" data-action="add-comment">Post Comment</button>
                    </div>
                </div>
            </section>
        </article>
    `;
}

function renderMenu() {
    return `
        <div class="discussion-menu">
            <button class="discussion-menu-btn" data-action="toggle-menu" title="Post options">&#8942;</button>
            <div class="discussion-dropdown">
                <button data-action="edit-post">Edit</button>
                <button data-action="delete-post">Delete</button>
            </div>
        </div>
    `;
}

function renderComments(post) {
    if (!post.comments.length) {
        return '<div class="discussion-no-comments">No comments yet.</div>';
    }

    return post.comments
        .map(
            (comment) => `
                <article class="discussion-comment ${canManageComment(comment) ? "can-manage" : ""}" data-comment-id="${comment.id}">
                    <div class="discussion-comment-meta">
                        <div>
                            <span class="discussion-comment-author">${escapeHtml(comment.username)}</span>
                        </div>
                    </div>
                    <p class="discussion-comment-text">${escapeHtml(comment.content)}</p>
                    ${
                        canManageComment(comment)
                            ? '<button class="discussion-comment-delete" data-action="delete-comment">Delete comment</button>'
                            : ""
                    }
                </article>
            `,
        )
        .join("");
}

async function onPostsClick(event) {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;

    const postEl = event.target.closest(".discussion-post");
    if (!postEl) return;

    const postId = postEl.dataset.postId;
    const post = posts.find((item) => item.id === postId);
    if (!post) return;

    const action = actionEl.dataset.action;

    if (action === "toggle-menu") {
        event.stopPropagation();
        toggleMenu(postEl);
        return;
    }

    if (action === "toggle-comments") {
        openComments[postId] = !openComments[postId];
        renderPosts();
        return;
    }

    if (action === "add-comment") {
        await addComment(postId);
        return;
    }

    if (action === "edit-post") {
        closeAllMenus();
        await editPost(post);
        return;
    }

    if (action === "delete-post") {
        closeAllMenus();
        await deletePost(post);
        return;
    }

    if (action === "delete-comment") {
        const commentEl = event.target.closest(".discussion-comment");
        if (!commentEl) return;

        const comment = post.comments.find((c) => c.id === commentEl.dataset.commentId);
        if (!comment) return;

        await deleteComment(post, comment);
    }
}

async function addComment(postId) {
    const input = document.getElementById(`commentInput-${postId}`);
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    try {
        await apiRequest(`${DISCUSSION_API}/${postId}/comments`, {
            method: "POST",
            body: JSON.stringify({ content: text }),
        });

        openComments[postId] = true;
        await loadMyDiscussions();
    } catch (error) {
        alert(error.message || "Failed to add comment.");
    }
}

async function editPost(post) {
    const nextContent = window.prompt("Edit your post", post.content);
    if (nextContent === null) return;

    const cleanContent = nextContent.trim();
    if (!cleanContent) {
        alert("Post content cannot be empty.");
        return;
    }

    try {
        await apiRequest(`${DISCUSSION_API}/${post.id}`, {
            method: "PUT",
            body: JSON.stringify({
                Title: post.title || deriveTitle(cleanContent),
                Content: cleanContent,
            }),
        });

        await loadMyDiscussions();
    } catch (error) {
        alert(error.message || "Failed to update post.");
    }
}

async function deletePost(post) {
    if (!window.confirm("Delete this discussion post?")) return;

    try {
        await apiRequest(`${DISCUSSION_API}/${post.id}`, { method: "DELETE" });
        delete openComments[post.id];
        await loadMyDiscussions();
    } catch (error) {
        alert(error.message || "Failed to delete post.");
    }
}

async function deleteComment(post, comment) {
    if (!comment.loaded) {
        alert("Comment details are not available. Reload and try again.");
        return;
    }

    if (!window.confirm("Delete this comment?")) return;

    try {
        await apiRequest(`${DISCUSSION_API}/${post.id}/comments/${comment.id}`, {
            method: "DELETE",
        });

        await loadMyDiscussions();
    } catch (error) {
        alert(error.message || "Failed to delete comment.");
    }
}

function onCommentDoubleClick(event) {
    const commentEl = event.target.closest(".discussion-comment.can-manage");
    if (!commentEl) return;

    postsContainer
        .querySelectorAll(".discussion-comment.show-delete")
        .forEach((el) => {
            if (el !== commentEl) el.classList.remove("show-delete");
        });

    commentEl.classList.toggle("show-delete");
}

function canManageComment(comment) {
    if (!comment.loaded) return false;
    const username = String(localStorage.getItem("username") || "").trim();
    return username !== "" && username === String(comment.username || "").trim();
}

function toggleMenu(postEl) {
    const dropdown = postEl.querySelector(".discussion-dropdown");
    if (!dropdown) return;

    const shouldOpen = !dropdown.classList.contains("open");
    closeAllMenus();
    if (shouldOpen) dropdown.classList.add("open");
}

function closeAllMenus() {
    postsContainer
        ?.querySelectorAll(".discussion-dropdown.open")
        .forEach((menu) => menu.classList.remove("open"));
}

function deriveTitle(content) {
    const singleLine = String(content || "").replace(/\s+/g, " ").trim();
    return singleLine.length > 60 ? `${singleLine.slice(0, 57)}...` : singleLine;
}

async function apiRequest(url, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
        const message = data.message || data.error || `Request failed (${response.status})`;
        throw new Error(message);
    }

    return data;
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";

    const now = new Date();
    const diffMs = now - date;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return "Just now";
    if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;

    return date.toLocaleString();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function onLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    alert("Logged out successfully.");
    window.location.href = "../index.html";
}

