// Slide animation on first load
window.addEventListener("load", () => {
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

const signupbtn=document.querySelector('.secondary-btn');

signupbtn.addEventListener("click",()=>
{
    console.log("hello world");
    window.location.href="/frontend/pages/signup.html";
});

// Temporary, will remove later once log out functionality is implemented
const pbtn=document.getElementById("profileBtn");
pbtn.addEventListener("click",()=>
{
    localStorage.removeItem("token");
    localStorage.removeItem('role');
    document.getElementById("loginBtn").style.display = "inline-block";
    document.getElementById("profileBtn").style.display = "none";
});