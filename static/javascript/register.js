document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.querySelector("input[name='username']").value.trim();
        const email = document.querySelector("input[name='email']").value.trim();
        const password = document.querySelector("input[name='password']").value.trim();

        if (!username || !email || !password) {
            alert("Fill all fields.");
            return;
        }

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Account created successfully!");
                window.location.href = "/login"; 
            } else {
                alert(data.message || "Registration failed.");
            }

        } catch (err) {
            console.error("Error:", err);
            alert("Server error. Try again.");
        }
    });
});
