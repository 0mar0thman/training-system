document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const form        = document.getElementById('login-form');
    const emailInput  = document.getElementById('login-email'); // Note: email field is used for username in our layout
    const passInput   = document.getElementById('login-password');
    const toggleBtn   = document.getElementById('toggle-password');
    const errEmail    = document.getElementById('error-email');
    const errPass     = document.getElementById('error-password');
    const generalErr  = document.getElementById('general-error');

    // ── Password visibility toggle ───────────────────────────────────────
    toggleBtn.addEventListener('click', () => {
        const isPassword = passInput.type === 'password';
        passInput.type = isPassword ? 'text' : 'password';
        toggleBtn.innerHTML = isPassword
            ? '<i data-lucide="eye-off" class="w-4 h-4"></i>'
            : '<i data-lucide="eye" class="w-4 h-4"></i>';
        lucide.createIcons();
    });

    // ── Helper: show/hide field error ───────────────────────────────────
    const showError = (el) => el.classList.add('visible');
    const hideError = (el) => el.classList.remove('visible');

    // ── Live validation: clear errors on type ───────────────────────────
    emailInput.addEventListener('input', () => hideError(errEmail));
    passInput.addEventListener('input',  () => hideError(errPass));

    // ── Form submission ─────────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        generalErr.classList.add('hidden');

        let valid = true;
        const usernameVal = emailInput.value.trim();
        const passwordVal = passInput.value;

        if (usernameVal.length === 0) {
            showError(errEmail);
            valid = false;
        }

        if (passwordVal.length === 0) {
            showError(errPass);
            valid = false;
        }

        if (!valid) return;

        const submitBtn = form.querySelector('[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<svg class="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><span>Signing In...</span>';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameVal, password: passwordVal })
            });

            const result = await response.json();

            if (result.success) {
                // Save user info
                localStorage.setItem('token', result.token);
                localStorage.setItem('user_role', result.user.role);
                localStorage.setItem('user_name', result.user.name);

                // Redirect to dashboard
                window.location.href = '/dashboard';
            } else {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
                lucide.createIcons();

                generalErr.textContent = result.message || 'Incorrect username or password.';
                generalErr.classList.remove('hidden');
            }
        } catch (error) {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            lucide.createIcons();

            generalErr.textContent = 'Server connection error. Please try again.';
            generalErr.classList.remove('hidden');
        }
    });
});
