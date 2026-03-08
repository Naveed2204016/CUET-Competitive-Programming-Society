// discussions.js - simple front-end storage
const token = localStorage.getItem("token");
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

// redirect non-logged in users
if (!token) {
    alert("Please login to access discussions.");
    window.location.href = "../index.html";
}

// toggle nav buttons
if (token) {
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("profileBtn").style.display = "inline-block";
}

let discussions = JSON.parse(localStorage.getItem("discussions") || "[]");

function saveDiscussions() {
    localStorage.setItem("discussions", JSON.stringify(discussions));
}

function renderDiscussions() {
    const container = document.getElementById("postsContainer");
    container.innerHTML = "";
    discussions.forEach(post => {
        const card = document.createElement("div");
        card.classList.add("discussion-post");
        card.innerHTML = `
            <p class="post-author">${post.author}</p>
            <p class="post-content">${post.content}</p>
            <div class="post-controls">
                <span class="upvotes">👍 ${post.upvotes}</span>
                <button class="secondary-btn" onclick="upvote(${post.id})">Upvote</button>
            </div>
            <div class="comments">
                <h4>Comments</h4>
                <div class="comment-list">
                    ${post.comments.map(c=>`<p><strong>${c.author}:</strong> ${c.text}</p>`).join('')}
                </div>
                <textarea id="commentInput-${post.id}" placeholder="Write a comment..."></textarea>
                <button class="secondary-btn" onclick="addComment(${post.id})">Comment</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function addPost() {
    const textarea = document.getElementById("postContent");
    const text = textarea.value.trim();
    if (!text) return;
    const id = discussions.length ? discussions[discussions.length-1].id + 1 : 1;
    discussions.push({
        id,
        author: currentUser.username,
        content: text,
        upvotes: 0,
        comments: []
    });
    textarea.value = "";
    saveDiscussions();
    renderDiscussions();
}

function upvote(postId) {
    const post = discussions.find(p=>p.id===postId);
    if (post) {
        post.upvotes++;
        saveDiscussions();
        renderDiscussions();
    }
}

function addComment(postId) {
    const input = document.getElementById(`commentInput-${postId}`);
    const text = input.value.trim();
    if (!text) return;
    const post = discussions.find(p=>p.id===postId);
    if (post) {
        post.comments.push({author: currentUser.username, text});
        saveDiscussions();
        renderDiscussions();
    }
}

const postBtn = document.getElementById("postBtn");
const postTextarea = document.getElementById("postContent");

// disable button when textarea is empty
postBtn.disabled = true;
postTextarea.addEventListener("input", () => {
    postBtn.disabled = postTextarea.value.trim() === "";
});

postBtn.addEventListener("click", addPost);

// initial render
renderDiscussions();