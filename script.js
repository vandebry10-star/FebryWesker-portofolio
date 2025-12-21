/**
 * Minecraft UI Theme JavaScript
 * FebryWesker Portfolio
 */

(function() {
  'use strict';

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initBackToTop();
    initToggleButtons();
    initSliders();
    initMobileMenu();
    addKeyboardNavigation();
    logConsoleMessage();
  }

  // ============================================
  // TAB SWITCHING
  // ============================================
  
  window.switchTab = function(index) {
    const tabs = document.querySelectorAll('.mc-tab');
    const boxes = document.querySelectorAll('.mc-box');
    
    // Remove active class from all tabs and boxes
    tabs.forEach(tab => tab.classList.remove('active'));
    boxes.forEach(box => box.classList.remove('active'));
    
    // Add active class to selected tab and box
    if (tabs[index]) tabs[index].classList.add('active');
    if (boxes[index]) boxes[index].classList.add('active');
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Play click sound (optional)
    playClickSound();
  };

  // ============================================
  // BACK TO TOP BUTTON
  // ============================================
  
  function initBackToTop() {
    const backBtn = document.querySelector('.mc-back');
    
    if (!backBtn) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > 300) {
        backBtn.classList.add('visible');
      } else {
        backBtn.classList.remove('visible');
      }
    }, 100));

    // Scroll to top on click
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      playClickSound();
    });
  }

  // ============================================
  // TOGGLE BUTTONS (ON/OFF)
  // ============================================
  
  function initToggleButtons() {
    const toggles = document.querySelectorAll('.mc-toggle');
    
    toggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        
        this.classList.toggle('off');
        
        if (this.classList.contains('off')) {
          this.textContent = 'OFF';
        } else {
          this.textContent = 'ON';
        }
        
        playClickSound();
      });
    });
  }

  // ============================================
  // SLIDERS
  // ============================================
  
  function initSliders() {
    const sliders = document.querySelectorAll('.mc-slider');
    
    sliders.forEach(slider => {
      const thumb = slider.querySelector('.mc-slider-thumb');
      if (!thumb) return;

      let isDragging = false;

      thumb.addEventListener('mousedown', startDrag);
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', stopDrag);

      // Touch support
      thumb.addEventListener('touchstart', startDrag);
      document.addEventListener('touchmove', drag);
      document.addEventListener('touchend', stopDrag);

      function startDrag(e) {
        isDragging = true;
        e.preventDefault();
      }

      function drag(e) {
        if (!isDragging) return;

        const rect = slider.getBoundingClientRect();
        let clientX = e.clientX || (e.touches && e.touches[0].clientX);
        let x = clientX - rect.left;
        
        // Constrain within bounds
        x = Math.max(0, Math.min(x, rect.width));
        
        // Update thumb position
        const percentage = (x / rect.width) * 100;
        thumb.style.left = percentage + '%';
        
        // Update associated label if exists
        const label = slider.previousElementSibling;
        if (label && label.querySelector('.mc-slider-value')) {
          label.querySelector('.mc-slider-value').textContent = Math.round(percentage) + '%';
        }
      }

      function stopDrag() {
        if (isDragging) {
          isDragging = false;
          playClickSound();
        }
      }
    });
  }

  // ============================================
  // MOBILE MENU
  // ============================================
  
  function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    
    if (!menuBtn || !menu) return;

    menuBtn.addEventListener('click', () => {
      menu.classList.toggle('open');
      playClickSound();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        menu.classList.remove('open');
      }
    });

    // Close menu when clicking a link
    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
      });
    });
  }

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================
  
  function addKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      const tabs = document.querySelectorAll('.mc-tab');
      const activeTab = document.querySelector('.mc-tab.active');
      
      if (!activeTab) return;

      const currentIndex = Array.from(tabs).indexOf(activeTab);

      // Arrow left/right to navigate tabs
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        switchTab(prevIndex);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        switchTab(nextIndex);
      }

      // Number keys (1-5) to jump to specific tabs
      if (e.key >= '1' && e.key <= '5') {
        const tabIndex = parseInt(e.key) - 1;
        if (tabs[tabIndex]) {
          e.preventDefault();
          switchTab(tabIndex);
        }
      }

      // Home key to go to first tab
      if (e.key === 'Home') {
        e.preventDefault();
        switchTab(0);
      }

      // End key to go to last tab
      if (e.key === 'End') {
        e.preventDefault();
        switchTab(tabs.length - 1);
      }
    });
  }

  // ============================================
  // SOUND EFFECTS (Optional)
  // ============================================
  
  function playClickSound() {
    // You can add actual Minecraft click sound here
    // For now, just a placeholder
     const audio = new Audio('click.ogg');
     audio.volume = 0.3;
     audio.play().catch(err => console.log('Audio play failed'));
  }

  // ============================================
  // PROJECT CARDS ANIMATION
  // ============================================
  
  function initProjectCards() {
    const projects = document.querySelectorAll('.mc-project');
    
    projects.forEach((project, index) => {
      project.style.animationDelay = `${index * 0.1}s`;
      
      project.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
      });

      project.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
      });
    });
  }

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ============================================
  // CONSOLE MESSAGE
  // ============================================
  
  function logConsoleMessage() {
    const styles = {
      title: 'color: #5cb85c; font-size: 20px; font-weight: bold; font-family: monospace;',
      dev: 'color: #5890d8; font-size: 16px; font-family: monospace;',
      info: 'color: #fff; font-size: 14px; font-family: monospace;',
      warning: 'color: #d85858; font-size: 12px; font-weight: bold; font-family: monospace;'
    };

    console.log('%c⛏ FEBRYWESKER PORTFOLIO', styles.title);
    console.log('%c🎮 Theme: Minecraft UI', styles.dev);
    console.log('%c💎 Projects: Minigame, Bot, Shop', styles.info);
    console.log('%c🔗 GitHub: github.com/vandebry10-star', styles.info);
    console.log('%c⚠ Do not paste unknown code here!', styles.warning);
  }

  // ============================================
  // EASTER EGG - Konami Code
  // ============================================
  
  let konamiCode = [];
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  
  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
      activateEasterEgg();
    }
  });

  function activateEasterEgg() {
    console.log('%c🎉 KONAMI CODE ACTIVATED!', 'color: #5cb85c; font-size: 24px; font-weight: bold;');
    console.log('%c💎 You found the secret! Achievement Unlocked!', 'color: #5890d8; font-size: 18px;');
    
    // Add special effect
    document.body.style.animation = 'shake 0.5s';
    
    setTimeout(() => {
      document.body.style.animation = '';
    }, 500);
  }

  // ============================================
  // PERFORMANCE MONITORING
  // ============================================
  
  function monitorPerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page Load Time: ${pageLoadTime}ms`);
      });
    }
  }

  // ============================================
  // ACCESSIBILITY IMPROVEMENTS
  // ============================================
  
  function improveAccessibility() {
    // Add ARIA labels
    const tabs = document.querySelectorAll('.mc-tab');
    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', tab.classList.contains('active'));
      tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');
    });

    const boxes = document.querySelectorAll('.mc-box');
    boxes.forEach((box, index) => {
      box.setAttribute('role', 'tabpanel');
      box.setAttribute('aria-hidden', !box.classList.contains('active'));
    });
  }

  // ============================================
  // LOCAL STORAGE (Save tab state)
  // ============================================
  
  function saveTabState() {
    const tabs = document.querySelectorAll('.mc-tab');
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        localStorage.setItem('activeTab', index);
      });
    });
  }

  function loadTabState() {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab !== null) {
      switchTab(parseInt(savedTab));
    }
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHORS
  // ============================================
  
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ============================================
  // WINDOW RESIZE HANDLER
  // ============================================
  
  let resizeTimer;
  window.addEventListener('resize', debounce(() => {
    console.log('Window resized');
    // Add any resize-specific logic here
  }, 250));

  // ============================================
  // VISIBILITY CHANGE HANDLER
  // ============================================
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('Tab is hidden');
    } else {
      console.log('Tab is visible');
    }
  });

  // Initialize additional features
  improveAccessibility();
  initSmoothScroll();
  initProjectCards();
  
  // Optional: Load saved tab state
  // loadTabState();
  // saveTabState();

  // Optional: Monitor performance
  // monitorPerformance();

})();
