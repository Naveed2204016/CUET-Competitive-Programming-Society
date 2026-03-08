// leaderboard.js
const tokenLB = localStorage.getItem("token");
if (!tokenLB) {
    alert("Please login to view leaderboard");
    window.location.href = "../index.html";
}

// toggle nav buttons
if (tokenLB) {
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("profileBtn").style.display = "inline-block";
}

function extractHandle(link) {
    if (!link) return null;
    link = link.trim();
    if (link.endsWith('/')) link = link.slice(0, -1);
    const parts = link.split('/');
    return parts[parts.length-1];
}

async function buildLeaderboard() {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.length === 0) {
        document.getElementById("leaderboardTable").insertAdjacentHTML('afterend', '<p>No users registered yet.</p>');
        return;
    }

    const now = Math.floor(Date.now() / 1000);
    const oneMonthAgo = now - 30 * 24 * 60 * 60;
    const results = [];

    // fetch ratings in batch
    const handles = users
        .map(u => extractHandle(u.cfLink))
        .filter(h => h);
    let ratingMap = {};
    if (handles.length) {
        try {
            const resp = await fetch(`https://codeforces.com/api/user.info?handles=${handles.join(';')}`);
            const data = await resp.json();
            if (data.status === 'OK') {
                data.result.forEach(u => {
                    ratingMap[u.handle.toLowerCase()] = u.rating || 0;
                });
            }
        } catch (e) {
            console.error('rating fetch error', e);
        }
    }

    for (const u of users) {
        const handle = extractHandle(u.cfLink);
        if (!handle) continue;
        let solved = 0;
        try {
            const resp = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1000`);
            const data = await resp.json();
            if (data.status === 'OK') {
                const set = new Set();
                data.result.forEach(sub => {
                    if (sub.verdict === 'OK' && sub.creationTimeSeconds >= oneMonthAgo) {
                        set.add(`${sub.problem.contestId}:${sub.problem.index}`);
                    }
                });
                solved = set.size;
            }
        } catch (e) {
            console.error('status fetch error', e);
        }
        results.push({
            username: u.username,
            handle,
            rating: ratingMap[handle.toLowerCase()] || 0,
            solved
        });
    }

    results.sort((a, b) => {
        if (b.solved !== a.solved) return b.solved - a.solved;
        return b.rating - a.rating;
    });

    render(results);
}

function render(list) {
    const tbody = document.querySelector('#leaderboardTable tbody');
    tbody.innerHTML = '';
    list.forEach((u, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${idx + 1}</td><td>${u.username} (${u.handle})</td><td>${u.solved}</td><td>${u.rating}</td>`;
        tbody.appendChild(tr);
    });
}

const refreshBtn = document.getElementById('refreshBtn');
refreshBtn?.addEventListener('click', () => {
    refreshBtn.textContent = 'Loading...';
    buildLeaderboard().finally(() => {
        refreshBtn.textContent = 'Refresh';
    });
});

buildLeaderboard();
