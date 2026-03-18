window.addEventListener("load", () => {
    console.log("Page loaded. Rendering topics...");
    const features = document.querySelector(".features");

    setTimeout(() => {
        features.classList.add("show");
    }, 300);
});


// Toggle login/profile based on token
const token = localStorage.getItem("token");

if (token) {
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("profileBtn").style.display = "inline-block";
} else {
    // prevent navigation to protected pages
    document.querySelectorAll('.nav-links a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('login.html') && !href.includes('signup.html')) {
            link.addEventListener('click', e => {
                e.preventDefault();
                alert('You must be logged in to access this page.');
            });
        }
    });
}


document.querySelector('.feature-card.announcements').addEventListener('click', () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to view announcements.");
        window.location.href = "./index.html";
    } else {
        window.location.href = "./pages/announcements.html";
    }
});

document.querySelector('.feature-card.contests').addEventListener('click', () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to view contests.");
        window.location.href = "./index.html";
    } else {
        window.location.href = "./pages/contests.html";
    }
});

const signupbtn = document.querySelector('.secondary-btn');

signupbtn.addEventListener("click", () => {
    console.log("hello world");
    window.location.href = "./pages/signup.html";
});

const wcpbtn = document.querySelector('.primary-btn');

wcpbtn.addEventListener("click", () => {
    window.location.href = "./pages/why-cp.html";
});


document.querySelector('.feature-card.resources').addEventListener('click', () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to view resources.");
        window.location.href = "./index.html";
    } else {
        window.location.href = "./pages/resources.html";
    }
});


document.querySelector('.feature-card.contests').addEventListener('click', () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to view contests.");
        window.location.href = "./index.html";
    } else {
        window.location.href = "./pages/contests.html";
    }
});

document.querySelector('.feature-card.editorials').addEventListener('click', () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to view editorials.");
        window.location.href = "./index.html";
    }
    else {
        window.location.href = "./pages/editorials.html";
    }
});

document.querySelector('.feature-card.discussions').addEventListener('click', () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to view discussions.");
        window.location.href = "./index.html";
    }
    else {
        window.location.href = "./pages/discussions.html";
    }
});

document.querySelector('.feature-card.leaderboard').addEventListener('click', () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to view leaderboard.");
        window.location.href = "./index.html";
    }
    else {
        window.location.href = "./pages/leaderboard.html";
    }
});


