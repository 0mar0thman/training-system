document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const form        = document.getElementById('register-form');
    const nameInput   = document.getElementById('reg-name');
    const emailInput  = document.getElementById('reg-email'); // Maps to username
    const companyInput= document.getElementById('reg-company');
    const passInput   = document.getElementById('reg-password');
    const confirmInput= document.getElementById('reg-confirm');
    const termsBox    = document.getElementById('agree-terms');
    const toggleBtn   = document.getElementById('toggle-reg-password');
    const strengthBar = document.getElementById('strength-bar');
    const strengthLabel = document.getElementById('strength-label');

    const errName     = document.getElementById('error-name');
    const errEmail    = document.getElementById('error-reg-email');
    const errCompany  = document.getElementById('error-company');
    const errPass     = document.getElementById('error-reg-password');
    const errConfirm  = document.getElementById('error-confirm');
    const errTerms    = document.getElementById('error-terms');

    // ── Helpers ──────────────────────────────────────────────────────────
    const showError = (el) => el.classList.add('visible');
    const hideError = (el) => el.classList.remove('visible');
    const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    // ── Clear errors on input ────────────────────────────────────────────
    nameInput.addEventListener('input',    () => hideError(errName));
    emailInput.addEventListener('input',   () => hideError(errEmail));
    companyInput.addEventListener('input', () => hideError(errCompany));
    confirmInput.addEventListener('input', () => hideError(errConfirm));
    termsBox.addEventListener('change',    () => hideError(errTerms));

    // ── Password visibility toggle ───────────────────────────────────────
    toggleBtn.addEventListener('click', () => {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        toggleBtn.innerHTML = isPass
            ? '<i data-lucide="eye-off" class="w-4 h-4"></i>'
            : '<i data-lucide="eye" class="w-4 h-4"></i>';
        lucide.createIcons();
    });

    // ── Password strength meter ──────────────────────────────────────────
    passInput.addEventListener('input', () => {
        hideError(errPass);
        const val = passInput.value;
        let score = 0;
        if (val.length >= 8)            score++;
        if (/[A-Z]/.test(val))          score++;
        if (/[0-9]/.test(val))          score++;
        if (/[^A-Za-z0-9]/.test(val))   score++;

        const levels = [
            { width: '0%',   color: 'bg-gray-200', label: '' },
            { width: '25%',  color: 'bg-red-400',   label: 'Weak' },
            { width: '50%',  color: 'bg-amber-400',  label: 'Fair' },
            { width: '75%',  color: 'bg-blue-400',   label: 'Good' },
            { width: '100%', color: 'bg-emerald-500', label: 'Strong' },
        ];
        const level = levels[score];
        strengthBar.style.width = level.width;
        strengthBar.className = `strength-bar-fill h-full rounded-full ${level.color}`;
        strengthLabel.textContent = level.label;
    });

    // ── Form submission ──────────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let valid = true;

        if (nameInput.value.trim().length < 2) {
            showError(errName); valid = false;
        }
        if (emailInput.value.trim().length < 3) {
            showError(errEmail); valid = false;
        }
        if (passInput.value.trim().length < 6) {
            showError(errPass); valid = false;
        }
        if (confirmInput.value !== passInput.value) {
            showError(errConfirm); valid = false;
        }
        if (!termsBox.checked) {
            showError(errTerms); valid = false;
        }

        if (!valid) return;

        const submitBtn = form.querySelector('[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<svg class="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg><span>Creating Account...</span>';
        submitBtn.disabled = true;

        try {
            // Determine role by email pattern for setup convenience (e.g. if username has admin/finance/sales/trainer)
            let detectedRole = 'SUPERVISOR';
            const emailLower = emailInput.value.toLowerCase();
            if (emailLower.includes('admin')) {
                detectedRole = 'ADMIN';
            } else if (emailLower.includes('finance')) {
                detectedRole = 'FINANCE';
            } else if (emailLower.includes('sales')) {
                detectedRole = 'SALES';
            } else if (emailLower.includes('trainer')) {
                detectedRole = 'TRAINER';
            }

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: emailInput.value.trim(),
                    password: passInput.value,
                    name: nameInput.value.trim(),
                    role: detectedRole
                })
            });

            const result = await response.json();

            if (result.success) {
                // Success: redirect to login
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
                lucide.createIcons();

                const msgEl = document.createElement('div');
                msgEl.className = 'text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3 font-medium text-center mb-4';
                msgEl.textContent = `✓ Account created successfully as ${detectedRole}! Redirecting to login...`;
                form.insertBefore(msgEl, form.firstChild);

                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
                lucide.createIcons();

                const errEl = document.createElement('div');
                errEl.className = 'text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3 font-medium text-center mb-4';
                errEl.textContent = `❌ ${result.message || 'Registration failed.'}`;
                form.insertBefore(errEl, form.firstChild);
            }
        } catch (error) {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            lucide.createIcons();

            alert('Server error during registration.');
        }
    });
});
