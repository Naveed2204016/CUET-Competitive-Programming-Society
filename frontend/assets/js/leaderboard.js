// leaderboard.js
const tokenLB = localStorage.getItem("token");
const leaderboardBody = document.querySelector("#leaderboardTable tbody");
const refreshBtn = document.getElementById("refreshBtn");

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
    const value = link.trim();
    if (!value) return null;

    if (!value.includes("/")) {
        return value.replace(/^@/, "");
    }

    const normalized = value.endsWith("/") ? value.slice(0, -1) : value;
    const parts = normalized.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1].replace(/^@/, "") : null;
}

function setRefreshState(isLoading) {
    if (!refreshBtn) return;
    refreshBtn.disabled = isLoading;
    refreshBtn.textContent = isLoading ? "Loading..." : "Refresh";
}

function renderMessage(message) {
    if (!leaderboardBody) return;
    leaderboardBody.innerHTML = `<tr><td colspan="4">${message}</td></tr>`;
}

async function fetchUsers() {
    const response = await fetch("http://localhost:5001/api/leaderboard", {
        headers: {
            Authorization: `Bearer ${tokenLB}`
        }
    });

    const data = await response.json();
    if (response.status === 401) {
        throw new Error("Unauthorized");
    }

    if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to load leaderboard users");
    }

    return Array.isArray(data.data) ? data.data : [];
}

async function fetchRatings(handles) {
    if (!handles.length) {
        return {};
    }

    try {
        const response = await fetch(`https://codeforces.com/api/user.info?handles=${handles.join(";")}`);
        const data = await response.json();

        if (data.status !== "OK") {
            throw new Error(data.comment || "Failed to load ratings");
        }

        return data.result.reduce((accumulator, user) => {
            accumulator[user.handle.toLowerCase()] = user.rating || 0;
            return accumulator;
        }, {});
    } catch (error) {
        console.error("Codeforces rating fetch error", error);
        return {};
    }
}

async function fetchSolvedCount(handle, oneMonthAgo) {
    try {
        const response = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=1000`);
        const data = await response.json();

        if (data.status !== "OK") {
            throw new Error(data.comment || "Failed to load submissions");
        }

        const solvedSet = new Set();
        data.result.forEach((submission) => {
            if (submission.verdict !== "OK" || submission.creationTimeSeconds < oneMonthAgo) {
                return;
            }

            const contestId = submission.problem?.contestId ?? "gym";
            const index = submission.problem?.index ?? "unknown";
            solvedSet.add(`${contestId}:${index}`);
        });

        return solvedSet.size;
    } catch (error) {
        console.error(`Codeforces submissions fetch error for ${handle}`, error);
        return 0;
    }
}

async function buildLeaderboard() {
    renderMessage("Loading leaderboard...");

    const users = await fetchUsers();
    if (!users.length) {
        renderMessage("No users registered yet.");
        return;
    }

    const now = Math.floor(Date.now() / 1000);
    const oneMonthAgo = now - 30 * 24 * 60 * 60;
    const handles = users
        .map((user) => ({
            username: user.Username,
            handle: extractHandle(user.CfHandle)
        }))
        .filter((user) => user.handle);

    if (!handles.length) {
        renderMessage("No valid Codeforces handles found.");
        return;
    }

    const uniqueHandles = [...new Set(handles.map((user) => user.handle))];
    const ratingMap = await fetchRatings(uniqueHandles);
    const solvedCounts = await Promise.all(
        uniqueHandles.map(async (handle) => [handle, await fetchSolvedCount(handle, oneMonthAgo)])
    );
    const solvedMap = Object.fromEntries(solvedCounts);

    const results = handles.map((user) => ({
        username: user.username,
        handle: user.handle,
        solved: solvedMap[user.handle] || 0,
        rating: ratingMap[user.handle.toLowerCase()] || 0
    }))
        .sort((a, b) => {
            if (b.solved !== a.solved) {
                return b.solved - a.solved;
            }

            return b.rating - a.rating;
        });

    render(results);
}

function render(list) {
    if (!leaderboardBody) return;

    if (!list.length) {
        renderMessage("No leaderboard data available.");
        return;
    }

    leaderboardBody.innerHTML = "";
    list.forEach((user, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username} (${user.handle})</td>
            <td>${user.solved}</td>
            <td>${user.rating}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

async function initializeLeaderboard() {
    setRefreshState(true);
    try {
        await buildLeaderboard();
    } catch (error) {
        console.error("Leaderboard build error", error);
        if (String(error.message).toLowerCase().includes("unauthorized") || String(error.message).toLowerCase().includes("token")) {
            alert("Session expired. Please login again.");
            localStorage.removeItem("token");
            window.location.href = "../pages/login.html";
            return;
        }

        renderMessage(error.message || "Failed to load leaderboard.");
    } finally {
        setRefreshState(false);
    }
}

refreshBtn?.addEventListener("click", initializeLeaderboard);

initializeLeaderboard();
