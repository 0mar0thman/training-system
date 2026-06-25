document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Toggle interaction logic (if any specific API calls are needed)
    const toggles = document.querySelectorAll('.toggle-checkbox');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const toggleId = e.target.id;
            
            // In a real application, you would send a request to the backend here
            console.log(`Setting ${toggleId} updated to: ${isChecked}`);
        });
    });

    // Profile form logic
    const profileBtn = document.querySelector('#profile-form button');
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Implement profile save API integration here
            const btnOriginalText = profileBtn.innerText;
            profileBtn.innerText = 'Saved!';
            profileBtn.classList.replace('bg-[#ab8038]', 'bg-emerald-600');
            
            setTimeout(() => {
                profileBtn.innerText = btnOriginalText;
                profileBtn.classList.replace('bg-emerald-600', 'bg-[#ab8038]');
            }, 2000);
        });
    }

    // Password form logic
    const passwordBtn = document.querySelector('#password-form button');
    if (passwordBtn) {
        passwordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Implement password update API integration here
            const btnOriginalText = passwordBtn.innerText;
            passwordBtn.innerText = 'Updated!';
            passwordBtn.classList.replace('bg-[#0a0e17]', 'bg-emerald-600');
            
            setTimeout(() => {
                passwordBtn.innerText = btnOriginalText;
                passwordBtn.classList.replace('bg-emerald-600', 'bg-[#0a0e17]');
            }, 2000);
        });
    }
});
