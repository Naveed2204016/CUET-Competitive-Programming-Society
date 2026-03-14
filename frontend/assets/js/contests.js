const API_BASE_URL = "http://localhost:5001/api";
let allContests = [];
let currentFilter = "all";
let currentUserId = null;
let isAdmin = false;

// Load contests on page load
window.addEventListener("load", () => {
  checkAdminAccess();
  getCurrentUserId();
  loadContests();
  setupFilterButtons();
  setupProfileButton();
});

// Get current user ID from token
function getCurrentUserId() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload.userId || payload.id;
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }
}

// Check if user is admin
function checkAdminAccess() {
  const role = localStorage.getItem('role');
  const adminSection = document.getElementById('adminSection');

  isAdmin = role === 'admin';

  if (isAdmin) {
    adminSection.style.display = 'block';
    document.getElementById('createBtn').addEventListener('click', createContest);
  }
}

// Load all contests
async function loadContests() {
  try {
    const response = await fetch(`${API_BASE_URL}/contests`);

    if (!response.ok) {
      const text = await response.text();
      console.error(`Server error ${response.status}:`, text);
      console.error('This usually means the backend server is not running.');
      alert(`Server error ${response.status}. Check console for details.`);
      return;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Server did not return JSON');
      alert('Server returned invalid response.');
      return;
    }

    const data = await response.json();

    if (data.success) {
      allContests = data.contests || [];
      displayContests(allContests);
    } else {
      console.error('API error:', data.message);
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error("Error loading contests:", error);
    alert('Network error: ' + error.message);
  }
}

// Display contests
function displayContests(contests) {
  const contestsList = document.getElementById('contestsList');
  contestsList.innerHTML = '';

  if (contests.length === 0) {
    contestsList.innerHTML = '<p class="no-contests">No contests found.</p>';
    return;
  }

  contests.forEach(contest => {
    const card = createContestCard(contest);
    contestsList.appendChild(card);
  });
}

// Check if user is registered for contest
function isUserRegistered(contest) {
  if (!currentUserId) return false;
  return contest.Participants && contest.Participants.some(p =>
    p._id === currentUserId || p === currentUserId
  );
}

// Create contest card element
function createContestCard(contest) {
  const card = document.createElement('div');
  card.className = 'contest-card';

  const startDate = new Date(contest.StartTime);
  const endDate = new Date(contest.EndTime);

  const startTime = startDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const endTime = endDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const isRegistered = isUserRegistered(contest);

  let statusBadge = '';
  if (contest.Status === 'Upcoming') {
    statusBadge = '<span class="status-badge upcoming">📅 Upcoming</span>';
  } else if (contest.Status === 'Ongoing') {
    statusBadge = '<span class="status-badge ongoing">🔴 Ongoing</span>';
  } else {
    statusBadge = '<span class="status-badge completed">✅ Completed</span>';
  }

  let levelBadge = '';
  if (contest.Level === 'Beginner') {
    levelBadge = '<span class="level-badge beginner">Beginner</span>';
  } else if (contest.Level === 'Intermediate') {
    levelBadge = '<span class="level-badge intermediate">Intermediate</span>';
  } else {
    levelBadge = '<span class="level-badge advanced">Advanced</span>';
  }

  // Admin actions HTML
  let adminActions = '';
  if (isAdmin) {
    adminActions = `
      <div class="admin-actions" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(168, 85, 247, 0.2); display: flex; gap: 8px;">
        <button class="admin-btn delete-btn" onclick="deleteContest('${contest._id}', event)" style="flex: 1; background: #ef4444; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; text-transform: uppercase;">
          🗑️ Delete
        </button>
      </div>
    `;
  }

  card.innerHTML = `
    <div class="contest-header">
      <div>
        <h3>${contest.Title}</h3>
        <p class="platform">${contest.Platform} • ${contest.Type}</p>
      </div>
      <div class="badges">
        ${statusBadge}
        ${levelBadge}
      </div>
    </div>

    <p class="description">${contest.Description}</p>

    <div class="contest-details">
      <div class="detail-item">
        <span class="label">📍 Start:</span>
        <span>${startTime}</span>
      </div>
      <div class="detail-item">
        <span class="label">⏱️ End:</span>
        <span>${endTime}</span>
      </div>
      <div class="detail-item">
        <span class="label">👥 Participants:</span>
        <span>${contest.Participants.length}</span>
      </div>
    </div>

    <div class="contest-actions">
      <a href="${contest.Link}" target="_blank" class="link-btn">View Contest</a>
      <button class="register-btn" onclick="toggleRegistration('${contest._id}', event)">
        ${isRegistered ? '✓ Registered' : '+ Register'}
      </button>
    </div>

    ${adminActions}
  `;

  return card;
}

// Create new contest
async function createContest() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const platform = document.getElementById('platform').value.trim();
  const link = document.getElementById('link').value.trim();
  const level = document.getElementById('level').value;
  const type = document.getElementById('type').value;

  // Validation
  if (!title || !description || !startTime || !endTime || !platform || !link || !level || !type) {
    alert('Please fill all fields');
    return;
  }

  if (new Date(endTime) <= new Date(startTime)) {
    alert('End time must be after start time');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in as admin to create contests');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/contests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Title: title,
        Description: description,
        StartTime: new Date(startTime).toISOString(),
        EndTime: new Date(endTime).toISOString(),
        Platform: platform,
        Link: link,
        Level: level,
        Type: type
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Error ${response.status}:`, text);
      try {
        const errorData = JSON.parse(text);
        alert('Error: ' + (errorData.message || errorData.error));
      } catch {
        alert(`Server error ${response.status}`);
      }
      return;
    }

    const data = await response.json();

    if (data.success) {
      alert('Contest created successfully!');

      // Clear form
      document.getElementById('title').value = '';
      document.getElementById('description').value = '';
      document.getElementById('startTime').value = '';
      document.getElementById('endTime').value = '';
      document.getElementById('platform').value = '';
      document.getElementById('link').value = '';
      document.getElementById('level').value = '';
      document.getElementById('type').value = '';

      // Reload contests
      loadContests();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error: ' + error.message);
  }
}

// Delete contest
async function deleteContest(contestId, event) {
  event.preventDefault();

  if (!confirm('Are you sure you want to delete this contest?')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/contests/${contestId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Error ${response.status}:`, text);
      try {
        const errorData = JSON.parse(text);
        alert('Error: ' + (errorData.message || errorData.error));
      } catch {
        alert(`Server error ${response.status}`);
      }
      return;
    }

    const data = await response.json();

    if (data.success) {
      alert('Contest deleted successfully!');
      loadContests();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error: ' + error.message);
  }
}

// Toggle registration
async function toggleRegistration(contestId, event) {
  event.preventDefault();

  const token = localStorage.getItem('token');

  if (!token) {
    alert('Please login to register for contests');
    window.location.href = './login.html';
    return;
  }

  const contest = allContests.find(c => c._id === contestId);
  const isRegistered = isUserRegistered(contest);
  const endpoint = isRegistered ? 'unregister' : 'register';

  try {
    const response = await fetch(`${API_BASE_URL}/contests/${contestId}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Error ${response.status}:`, text);
      try {
        const errorData = JSON.parse(text);
        alert('Error: ' + (errorData.message || errorData.error));
      } catch {
        alert(`Server error ${response.status}`);
      }
      return;
    }

    const data = await response.json();

    if (data.success) {
      alert(data.message);
      loadContests();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error: ' + error.message);
  }
}

// Setup filter buttons
function setupFilterButtons() {
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentFilter = btn.getAttribute('data-filter');

      if (currentFilter === 'all') {
        displayContests(allContests);
      } else {
        const filtered = allContests.filter(c => c.Status === currentFilter);
        displayContests(filtered);
      }
    });
  });
}

// Setup profile button
function setupProfileButton() {
  const profileBtn = document.getElementById('profileBtn');
  if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      window.location.href = '../index.html';
    });
  }
}
