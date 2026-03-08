(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function closeSidebars() {
    var sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    var aside = document.querySelector('aside');
    if (aside) aside.classList.remove('mobile-open');

    var overlay = document.getElementById('sidebarOverlay') || document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('mobile-open');
  }

  onReady(function () {
    var mobileButtons = document.querySelectorAll('.mobile-menu-btn');
    mobileButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.toggle('mobile-open');

        var aside = document.querySelector('aside');
        if (aside) aside.classList.toggle('mobile-open');

        var overlay = document.getElementById('sidebarOverlay') || document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.toggle('mobile-open');
      });
    });

    var overlay = document.getElementById('sidebarOverlay') || document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeSidebars);
    }

    var navLinks = document.querySelectorAll('.sidebar .nav-item, aside a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          closeSidebars();
        }
      });
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        closeSidebars();
      }
    });
  });
})();
