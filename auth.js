const DomasiHubApi = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:3000'
    : '';

function apiUrl(path) {
    return `${DomasiHubApi}${path}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const regInput = document.getElementById('regNumber');
    const regFeedback = document.getElementById('validationFeedback');
    
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const passwordFeedback = document.getElementById('passwordFeedback');
    
    const signUpForm = document.getElementById('signUpForm');

    // 1. Silent Gatekeeper Validation (Triggers only when clicking away)
    regInput.addEventListener('blur', () => {
        const value = regInput.value.trim();
        const regPattern = /^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i;

        if (value === "") {
            regInput.className = "";
            regFeedback.textContent = "";
            return;
        }

        if (regPattern.test(value)) {
            // Keep it completely silent. Remove classes and text to keep attackers guessing.
            regInput.className = "";
            regFeedback.textContent = "";
        } else {
            // Only flag errors when they leave the field completely
            regInput.className = "invalid";
            regFeedback.textContent = "Invalid entry.";
            regFeedback.className = "feedback-message error";
        }
    });

    // Clear error style immediately when they click back inside to fix it
    regInput.addEventListener('focus', () => {
        regInput.className = "";
        regFeedback.textContent = "";
    });

    // 2. Live Password Matching Validation
    const checkPasswords = () => {
        const pass = passwordInput.value;
        const confirmPass = confirmInput.value;

        if (confirmPass === "") {
            confirmInput.className = "";
            passwordFeedback.textContent = "";
            return;
        }

        if (pass === confirmPass) {
            confirmInput.className = "valid";
            passwordFeedback.textContent = "Passwords match.";
            passwordFeedback.className = "feedback-message success";
        } else {
            confirmInput.className = "invalid";
            passwordFeedback.textContent = "Passwords do not match.";
            passwordFeedback.className = "feedback-message error";
        }
    };

    passwordInput.addEventListener('input', checkPasswords);
    confirmInput.addEventListener('input', checkPasswords);

    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('fullName').value.trim();
        const whatsappNumber = document.getElementById('whatsappNumber').value.trim();
        const regNumberValue = regInput.value.trim();
        const passwordValue = passwordInput.value;
        const confirmPasswordValue = confirmInput.value;

        const isRegValid = /^BED\/(SCI|HUM|SSC|LAC)(?:\/ODEL)?\/\d{3,4}\/\d{2}$/i.test(regNumberValue);
        const doPasswordsMatch = passwordValue === confirmPasswordValue;

        if (!fullName || !whatsappNumber || !isRegValid || !doPasswordsMatch || passwordValue === "") {
            alert("Please complete the form correctly before continuing.");
            return;
        }

        try {
            const response = await fetch(apiUrl('/api/signup'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName,
                    regNumber: regNumberValue,
                    whatsappNumber,
                    password: passwordValue
                })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || 'Unable to create account.');
                return;
            }

            alert('Account created successfully. You can now sign in.');
            window.location.href = 'signin.html';
        } catch (error) {
            console.error('Signup error:', error);
            alert('Unable to reach the server. Please try again later.');
        }
    });
});