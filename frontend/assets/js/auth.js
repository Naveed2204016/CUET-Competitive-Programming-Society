// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        // Temporary frontend simulation
        if (username && password) {

            // Fake token
            localStorage.setItem("token", "dummyToken123");

            // Fake role logic
            if (username.toLowerCase() === "admin") {
                localStorage.setItem("role", "admin");
            } else {
                localStorage.setItem("role", "member");
            }

            alert("Login Successful");
            window.location.href = "../index.html";
        }
    });
}


// SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();

        alert("Signup Successful. Please Login.");
        window.location.href = "login.html";
    });
}