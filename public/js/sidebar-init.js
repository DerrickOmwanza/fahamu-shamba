/**
 * Centralized Sidebar Initialization & Control
 * This script handles all sidebar/hamburger functionality across the app
 */

// Load sidebar component into the DOM
async function loadSidebarComponent() {
    try {
        const response = await fetch('/components/sidebar.html');
        const html = await response.text();
        const sidebarContainer = document.createElement('div');
        sidebarContainer.innerHTML = html;
        document.body.insertBefore(sidebarContainer.firstElementChild, document.body.firstChild);
        document.body.insertBefore(sidebarContainer.firstElementChild, document.body.firstChild);
        
        // Initialize after insertion
        initSidebarBehavior();
        loadUserData();
        setActiveNavItem();
    } catch (error) {
        console.error('Failed to load sidebar component:', error);
    }
}

// Toggle sidebar visibility on mobile
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!sidebar || !overlay) {
        console.warn('Sidebar elements not found');
        return;
    }
    
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('mobile-open');
}

// Close sidebar on mobile
function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!sidebar || !overlay) return;
    
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('mobile-open');
}

// Load user data from localStorage into sidebar
function loadUserData() {
    const cached = localStorage.getItem('user');
    if (cached) {
        try {
            const user = JSON.parse(cached);
            const userName = document.getElementById('userName');
            const userPhone = document.getElementById('userPhone');
            const navProfileName = document.getElementById('navProfileName');
            const navProfileAvatar = document.getElementById('navProfileAvatar');
            
            if (userName) userName.textContent = user.name || 'Farmer';
            if (userPhone) userPhone.textContent = user.phone || '—';
            if (navProfileName) navProfileName.textContent = user.name || 'Farmer';
            if (navProfileAvatar) navProfileAvatar.textContent = (user.name ? user.name.charAt(0).toUpperCase() : '👤');
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
}

// Set active nav item based on current page
function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.includes(currentPage)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Logout handler
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Initialize sidebar behavior (close on nav click, etc.)
function initSidebarBehavior() {
    // Close sidebar when clicking nav items on mobile
    const navItems = document.querySelectorAll('.sidebar .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                closeMobileSidebar();
            }
        });
    });
    
    // Close sidebar when clicking overlay
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeMobileSidebar);
    }
}

// Load sidebar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSidebarComponent);
} else {
    loadSidebarComponent();
}
