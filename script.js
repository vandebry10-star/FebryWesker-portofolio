/**
 * FebryWesker Portfolio JavaScript
 * Theme: Elegant Blue Purple Pink
 * Mobile-First Interactive Features
 */

(function() {
  'use strict';

  // ============================================
  // INITIALIZATION
  // ============================================
  
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setCurrentYear();
    generateStars();
    initMobileMenu();
    initTypingEffect();
    initSmoothScroll();
    initScrollReveal();
    initBackToTop();
    initContactForm();
    initNavbarBehavior();
    initButtonRipple();
    initParallaxHero();
    preventImageRightClick();
    logConsoleMessage();
    initLazyLoading();
  }

  // ============================================
  // SET CURRENT YEAR IN FOOTER
  // ============================================
  
  function setCurrentYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  // ============================================
  // GENERATE ANIMATED STARS
  // ============================================
  
  function generateStars() {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;

    const starCount = window.innerWidth < 768 ? 50 : 100;
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      star.style.animationDuration = (Math.random() * 2 + 2) + 's';
      starsContainer.appendChild(star);
    }
  }

  // ============================================
  // MOBILE MENU TOGGLE
  // ============================================
  
  function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!mobileMenuBtn || !mobileMenu) return;

    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const icon = mobileMenuBtn.querySelector('i');
      
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });

    // Close menu when clicking links
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.remove('open');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
  }

  // ============================================
  // TYPING EFFECT
  // ============================================
  
  function initTypingEffect() {
    const phrases = [
      'Web Game Developer',
      'WhatsApp Bot Creator',
      'UI/UX Designer',
      'Full Stack Developer',
      'Problem Solver',
      'E-commerce Builder'
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.getElementById('typing');
    
    if (!typingElement) return;

    function type() {
      const currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      // Pause at end of phrase
      if (!isDeleting && charIndex === currentPhrase.length) {
        setTimeout(() => { 
          isDeleting = true; 
          type(); 
        }, 2000);
        return;
      }

      // Move to next phrase
      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(type, 500);
        return;
      }

      const speed = isDeleting ? 50 : 100;
      setTimeout(type, speed);
    }
    
    type();
  }

  // ============================================
  // SMOOTH SCROLL
  // ============================================
  
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (!target) return;
        
        const offset = 80; // Navbar height
        const targetPosition = target.offsetTop - offset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  }

  // ============================================
  // SCROLL REVEAL ANIMATIONS
  // ============================================
  
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    if (reveals.length === 0) return;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animation
          setTimeout(() => {
            entry.target.classList.add('active');
          }, index * 100);
          
          // Stop observing once revealed
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(reveal => revealObserver.observe(reveal));
  }

  // ============================================
  // BACK TO TOP BUTTON
  // ============================================
  
  function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;

    let scrollThreshold = 300;
    
    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > scrollThreshold) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, 100));

    backToTop.addEventListener('click', () => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    });
  }

  // ============================================
  // CONTACT FORM HANDLING
  // ============================================
  
  function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');
    
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const messageInput = document.getElementById('form-message');
      
      if (!nameInput || !emailInput || !messageInput) return;
      
      const name = sanitizeInput(nameInput.value.trim());
      const email = sanitizeInput(emailInput.value.trim());
      const message = sanitizeInput(messageInput.value.trim());
      
      // Validation
      if (!name || name.length < 2) {
        showAlert('Please enter a valid name (minimum 2 characters)');
        return;
      }
      
      if (!validateEmail(email)) {
        showAlert('Please enter a valid email address');
        return;
      }
      
      if (!message || message.length < 10) {
        showAlert('Please enter a message (minimum 10 characters)');
        return;
      }
      
      // Show success feedback
      if (formFeedback) {
        formFeedback.classList.remove('hidden');
      }
      
      // Optional: Create mailto link
      const mailtoLink = `mailto:febrywesker@dev.com?subject=Portfolio Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}%0A%0AFrom: ${encodeURIComponent(email)}`;
      
      // Reset form after delay
      setTimeout(() => {
        contactForm.reset();
        if (formFeedback) {
          formFeedback.classList.add('hidden');
        }
        
        // Optionally open email client
        // window.location.href = mailtoLink;
      }, 3000);
    });
  }

  // ============================================
  // NAVBAR HIDE/SHOW ON SCROLL
  // ============================================
  
  function initNavbarBehavior() {
    let lastScroll = 0;
    const nav = document.querySelector('nav');
    
    if (!nav) return;

    window.addEventListener('scroll', throttle(() => {
      const currentScroll = window.scrollY;
      
      if (currentScroll <= 0) {
        nav.style.transform = 'translateY(0)';
        return;
      }
      
      if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down
        nav.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up
        nav.style.transform = 'translateY(0)';
      }
      
      lastScroll = currentScroll;
    }, 100));
  }

  // ============================================
  // BUTTON RIPPLE EFFECT
  // ============================================
  
  function initButtonRipple() {
    const buttons = document.querySelectorAll('.btn, button');
    
    buttons.forEach(button => {
      button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          left: ${x}px;
          top: ${y}px;
          transform: translate(-50%, -50%) scale(0);
          animation: rippleEffect 0.6s ease-out;
          pointer-events: none;
          z-index: 1000;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    });

    // Add ripple animation to document
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes rippleEffect {
          to {
            transform: translate(-50%, -50%) scale(15);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // ============================================
  // PARALLAX HERO EFFECT
  // ============================================
  
  function initParallaxHero() {
    const hero = document.querySelector('#home');
    if (!hero) return;
    
    // Only apply on desktop
    if (window.innerWidth < 768) return;

    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY < window.innerHeight) {
        const scrolled = window.scrollY;
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = 1 - (scrolled / window.innerHeight) * 0.5;
      }
    }, 16));
  }

  // ============================================
  // PREVENT IMAGE RIGHT-CLICK
  // ============================================
  
  function preventImageRightClick() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('contextmenu', e => e.preventDefault());
    });
  }

  // ============================================
  // LAZY LOADING IMAGES
  // ============================================
  
  function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length === 0) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // ============================================
  // CONSOLE MESSAGE
  // ============================================
  
  function logConsoleMessage() {
    const styles = {
      title: 'color: #8b5cf6; font-size: 20px; font-weight: bold;',
      dev: 'color: #ec4899; font-size: 16px; font-weight: bold;',
      info: 'color: #6366f1; font-size: 14px;',
      link: 'color: #a855f7; font-size: 14px;',
      warning: 'color: #ef4444; font-size: 12px; font-weight: bold;'
    };

    console.log('%c🚀 FebryWesker Portfolio', styles.title);
    console.log('%c💜 Developer: FebryWesker', styles.dev);
    console.log('%c🎮 Projects: Minigame, Bot, Shop', styles.info);
    console.log('%c🔗 GitHub: https://github.com/vandebry10-star', styles.link);
    console.log('%c⚠️ Warning: Do not paste unknown code here!', styles.warning);
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

  function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function showAlert(message) {
    alert(message);
  }

  // ============================================
  // PERFORMANCE OPTIMIZATION
  // ============================================
  
  // Reduce animations on low-end devices
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    document.documentElement.style.setProperty('--animation-speed', '0.5');
  }

  // Handle visibility change (pause animations when tab is hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.body.style.animationPlayState = 'paused';
    } else {
      document.body.style.animationPlayState = 'running';
    }
  });

  // ============================================
  // SECURITY: DISABLE DEV TOOLS IN PRODUCTION
  // ============================================
  
  (function() {
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1' &&
                        !window.location.hostname.includes('192.168');
    
    if (isProduction) {
      // Disable common dev tools shortcuts
      document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12') {
          e.preventDefault();
          return false;
        }
        
        // Ctrl+Shift+I (Windows/Linux)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
          e.preventDefault();
          return false;
        }
        
        // Ctrl+Shift+J (Windows/Linux)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
          e.preventDefault();
          return false;
        }
        
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'U') {
          e.preventDefault();
          return false;
        }
        
        // Cmd+Option+I (Mac)
        if (e.metaKey && e.altKey && e.key === 'I') {
          e.preventDefault();
          return false;
        }
      });

      // Detect dev tools
      let devtools = { open: false };
      const threshold = 160;
      
      setInterval(() => {
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
          if (!devtools.open) {
            devtools.open = true;
            console.log('%c⚠️ Developer tools detected', 'color: #ef4444; font-size: 16px; font-weight: bold;');
          }
        } else {
          devtools.open = false;
        }
      }, 1000);
    }
  })();

  // ============================================
  // EASTER EGG
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
    console.log('%c🎉 Konami Code Activated!', 'color: #8b5cf6; font-size: 24px; font-weight: bold;');
    console.log('%c🌟 You found the secret!', 'color: #ec4899; font-size: 18px;');
    
    // Add rainbow effect to gradient text
    const gradientTexts = document.querySelectorAll('.gradient-text');
    gradientTexts.forEach(text => {
      text.style.animation = 'none';
      text.style.background = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff)';
      text.style.backgroundSize = '200% 200%';
      text.style.animation = 'gradientShift 2s ease infinite';
    });
  }

  // ============================================
  // HANDLE WINDOW RESIZE
  // ============================================
  
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Reinit parallax on resize
      if (window.innerWidth >= 768) {
        initParallaxHero();
      }
    }, 250);
  });

})();
