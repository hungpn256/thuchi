// Script to handle theme color for PWA
// This runs before the React application loads

(function () {
  try {
    // Define transition durations - keep in sync with CSS
    const TRANSITION_DURATION = 300; // ms
    const ANIMATION_DELAY = 50; // ms for enabling animations
    const THEME_COLORS = {
      light: '#ffffff',
      dark: '#18181b',
    };

    // Add CSS variable for duration
    document.documentElement.style.setProperty(
      '--theme-transition-duration',
      `${TRANSITION_DURATION}ms`,
    );

    // Add class to document to prevent flashing
    document.documentElement.classList.add('pwa-init');

    // Apply default theme before React loads to avoid flash
    let initialTheme = 'light';

    // Get theme from localStorage if available
    if ('localStorage' in window) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        initialTheme = savedTheme;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // If no theme is saved, check system preferences
        initialTheme = 'dark';
      }
    }

    // Apply theme to document
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const themeColor = THEME_COLORS[initialTheme] || THEME_COLORS.light;

    // Store for ThemeDetector to use later
    if ('localStorage' in window) {
      localStorage.setItem('thuchi-theme-color', themeColor);
      localStorage.setItem('thuchi-initial-theme', initialTheme);
    }

    // Update meta tag when page starts loading
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute('content', themeColor);

    // Create style to prevent flashing during loading
    const style = document.createElement('style');
    style.textContent = `
      .pwa-init * {
        transition: none !important; 
        animation: none !important;
      }
      .pwa-init .animate-float,
      .pwa-init .animate-float-delay,
      .pwa-init .animate-gradient {
        opacity: 1 !important;
        transform: none !important;
      }
    `;
    document.head.appendChild(style);

    // Create observer to detect when app has fully loaded
    const appReadyObserver = new MutationObserver(() => {
      const appRoot = document.getElementById('root');
      if (appRoot && appRoot.children.length > 0) {
        // Remove pwa-init class after app loads to allow transitions
        document.documentElement.classList.remove('pwa-init');

        // Add transition class after a small delay to allow animations
        setTimeout(() => {
          document.documentElement.classList.add('transitions-enabled');
          appReadyObserver.disconnect();
        }, ANIMATION_DELAY);
      }
    });

    // Start observing DOM changes
    appReadyObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Fallback if observer doesn't work
    setTimeout(() => {
      document.documentElement.classList.remove('pwa-init');

      setTimeout(() => {
        document.documentElement.classList.add('transitions-enabled');
        appReadyObserver.disconnect();
      }, ANIMATION_DELAY);
    }, TRANSITION_DURATION * 2);

    // Monitor theme changes
    if ('localStorage' in window) {
      window.addEventListener('storage', (event) => {
        if (event.key === 'theme' && (event.newValue === 'dark' || event.newValue === 'light')) {
          // Add class to control animation on theme change
          document.documentElement.classList.add('changing-theme');

          // Update theme color for PWA
          metaThemeColor.setAttribute('content', THEME_COLORS[event.newValue]);

          // Remove class after transition completes
          setTimeout(() => {
            document.documentElement.classList.remove('changing-theme');
          }, TRANSITION_DURATION);
        }
      });
    }
  } catch (error) {
    console.error('Error in PWA theme script:', error);
  }
})();
