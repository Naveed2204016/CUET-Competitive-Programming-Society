const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;
        try{
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "content-type":"application/json" },
                body: JSON.stringify({ Username: username, Password: password })
            });

            const data = await response.json();
            if(data.success)
            {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("username", data.Username);
                localStorage.setItem("id", data.ID);
                alert("Login Successful");
                window.location.href = "/frontend/index.html";
            }
            else{
                alert(data.message || "Login failed. Please try again.");
            }

        }catch(err)
        {
            alert("Server error. Please try again later.");
        }
    });
}


const signupForm = document.getElementById("signupForm");


if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const facultyId = document.getElementById("facultyId").value.trim();
        const email = document.getElementById("email").value.trim();
        const cfLink = document.getElementById("cfLink").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        if (!username || !cfLink || !password || !facultyId || !email) {
            alert("Please fill all required fields.");
            return;
        }

        try
        {
            const response = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: {
                    "content-type":"application/json"
                },
                body: JSON.stringify({
                    Username: username,
                    ID: facultyId,
                    Email: email,
                    CfHandle: cfLink,
                    Password: password,
                    Role: role
                })
            });

            const data = await response.json();
            if(data.success)
            {
                alert("Signup Successful. Please Login.");
                window.location.href = "/frontend/pages/login.html";
            }
            else
            {
                alert("Signup failed. Please try again.");
            }

        }catch(err)
        {
            alert("Server error. Please try again later.");
        }
    });
}