document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('themeToggle');
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('domasi-theme');

    const applyTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        if (toggleButton) {
            toggleButton.setAttribute('aria-pressed', String(theme === 'dark'));
        }
    };

    const currentTheme = savedTheme || 'light';
    applyTheme(currentTheme);

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(nextTheme);
            localStorage.setItem('domasi-theme', nextTheme);
        });
    }
});
