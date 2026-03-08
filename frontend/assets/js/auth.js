// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        const users = getStoredUsers();
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            alert("Invalid credentials");
            return;
        }

        localStorage.setItem("token", "dummyToken123");
        localStorage.setItem("role", user.role);
        // preserve cfLink for convenience
        localStorage.setItem("cfLink", user.cfLink);
        localStorage.setItem("currentUser", JSON.stringify(user));

        alert("Login Successful");
        window.location.href = "../index.html";
    });
}


// SIGNUP
const signupForm = document.getElementById("signupForm");

function getStoredUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const facultyId = document.getElementById("facultyId").value.trim();
        const email = document.getElementById("email").value.trim();
        const cfLink = document.getElementById("cfLink").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        if (!username || !cfLink || !password || !role) {
            alert("Please fill all required fields.");
            return;
        }

        const users = getStoredUsers();
        // simple duplicate check
        if (users.some(u => u.username === username)) {
            alert("Username already exists");
            return;
        }

        users.push({
            username,
            facultyId,
            email,
            cfLink,
            password,
            role
        });
        saveUsers(users);

        alert("Signup Successful. Please Login.");
        window.location.href = "login.html";
    });
}