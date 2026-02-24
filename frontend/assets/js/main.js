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
}