/**
 * Minecraft Portfolio JavaScript
 * Sound Effects + Animations
 */

(function() {
  'use strict';

  // Initialize
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    generateParticles();
    initTypingEffect();
    initSmoothScroll();
    initNavbarScroll();
    initMobileMenu();
    initBackToTop();
    initSoundEffects();
    initScrollAnimations();
    initSkillCards();
    logConsole();
  }

  // ============================================
  // MINECRAFT PARTICLES
  // ============================================
  
  function generateParticles() {
    const container = document.getElementById('particles');
    const particleCount = window.innerWidth < 768 ? 30 : 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'mc-particle';
      
      // Random position
      particle.style.left = Math.random() * 100 + '%';
      
      // Random delay
      particle.style.animationDelay = Math.random() * 5 + 's';
      
      // Random duration
      particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
      
      // Random colors (white, light blue, light yellow)
      const colors = [
        'rgba(255, 255, 255, 0.6)',
        'rgba(173, 216, 230, 0.6)',
        'rgba(255, 255, 224, 0.6)'
      ];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      container.appendChild(particle);
    }
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
      'Minecraft Enthusiast'
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

      if (!isDeleting && charIndex === currentPhrase.length) {
        setTimeout(() => { 
          isDeleting = true; 
          type(); 
        }, 2000);
        return;
      }

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
        
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
          mobileMenu.classList.remove('active');
        }
        
        // Play click sound
        playSound('click');
        
        // Smooth scroll
        const offsetTop = target.offsetTop - 70;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      });
    });
  }

  // ============================================
  // NAVBAR SCROLL EFFECT
  // ============================================
  
  function initNavbarScroll() {
    const navbar = document.querySelector('.mc-navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', throttle(() => {
      const currentScroll = window.scrollY;
      
      if (currentScroll <= 0) {
        navbar.style.transform = 'translateY(0)';
        return;
      }
      
      if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
      }
      
      lastScroll = currentScroll;
    }, 100));
  }

  // ============================================
  // MOBILE MENU
  // ============================================
  
  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!toggleBtn || !mobileMenu) return;

    toggleBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      playSound('click');
      
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
      }
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
  }

  // ============================================
  // BACK TO TOP BUTTON
  // ============================================
  
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, 100));

    btn.addEventListener('click', () => {
      playSound('click');
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ============================================
  // SOUND EFFECTS
  // ============================================
  
  function initSoundEffects() {
    // Add click sound to all buttons
    const buttons = document.querySelectorAll('.mc-btn, .mc-nav-btn, .mc-mobile-link, .mc-skill-card, .mc-project-card, .mc-contact-card');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        playSound('click');
      });
    });

    // Add hover sound to buttons
    buttons.forEach(btn => {
      btn.addEventListener('mouseenter', function() {
        playSound('hover');
      });
    });
  }

  function playSound(type) {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'click') {
      // Minecraft click sound (sharp, high-pitched)
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'hover') {
      // Soft hover sound
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    }
  }

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe cards
    const cards = document.querySelectorAll('.mc-card, .mc-skill-card, .mc-project-card, .mc-contact-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(50px)';
      card.style.transition = `all 0.6s ease ${index * 0.1}s`;
      observer.observe(card);
    });
  }

  // ============================================
  // SKILL CARDS INTERACTION
  // ============================================
  
  function initSkillCards() {
    const skillCards = document.querySelectorAll('.mc-skill-card');
    
    skillCards.forEach(card => {
      card.addEventListener('click', function() {
        // Add clicked effect
        this.style.transform = 'translateY(2px) scale(0.98)';
        
        setTimeout(() => {
          this.style.transform = '';
        }, 100);
      });
    });

    // Animate progress bars on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const progressBar = entry.target.querySelector('.mc-skill-progress');
          if (progressBar) {
            const width = progressBar.style.width;
            progressBar.style.width = '0';
            setTimeout(() => {
              progressBar.style.width = width;
              progressBar.style.transition = 'width 1.5s ease-out';
            }, 100);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    skillCards.forEach(card => observer.observe(card));
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
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // ============================================
  // CONSOLE MESSAGE
  // ============================================
  
  function logConsole() {
    const styles = {
      title: 'color: #7cbd52; font-size: 24px; font-weight: bold; font-family: monospace; text-shadow: 2px 2px 0 #000;',
      subtitle: 'color: #5890d8; font-size: 16px; font-family: monospace;',
      info: 'color: #ffd700; font-size: 14px; font-family: monospace;',
      warning: 'color: #d85858; font-size: 12px; font-weight: bold; font-family: monospace;'
    };

    console.log('%c⛏ FEBRYWESKER PORTFOLIO ⛏', styles.title);
    console.log('%c🎮 Minecraft UI Theme', styles.subtitle);
    console.log('%c💎 Sound Effects Enabled!', styles.info);
    console.log('%c🔗 GitHub: github.com/vandebry10-star', styles.info);
    console.log('%c⚠️ Do not paste unknown code here!', styles.warning);
    console.log('%c✨ Easter Egg: Try Konami Code (↑↑↓↓←→←→BA)', styles.info);
  }

  // ============================================
  // EASTER EGG - KONAMI CODE
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
    console.log('%c🎉 KONAMI CODE ACTIVATED!', 'color: #7cbd52; font-size: 24px; font-weight: bold;');
    console.log('%c💎 Achievement Unlocked: Secret Miner!', 'color: #5ddbf4; font-size: 18px;');
    
    // Add diamond rain effect
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        createDiamondParticle();
      }, i * 100);
    }
    
    // Play special sound
    playSpecialSound();
    
    // Shake effect
    document.body.style.animation = 'shake 0.5s';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 500);
  }

  function createDiamondParticle() {
    const diamond = document.createElement('div');
    diamond.style.cssText = `
      position: fixed;
      top: -50px;
      left: ${Math.random() * 100}%;
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #5ddbf4 0%, #3bb5e8 50%, #5ddbf4 100%);
      box-shadow: 0 0 10px #5ddbf4, inset -2px -2px 0 rgba(0,0,0,0.3);
      transform: rotate(45deg);
      pointer-events: none;
      z-index: 9999;
      animation: diamondFall 2s ease-in forwards;
    `;
    
    document.body.appendChild(diamond);
    
    setTimeout(() => diamond.remove(), 2000);
  }

  function playSpecialSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Play a chord
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.5);
      
      oscillator.start(audioContext.currentTime + index * 0.1);
      oscillator.stop(audioContext.currentTime + index * 0.1 + 0.5);
    });
  }

  // Add shake animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes diamondFall {
      0% {
        transform: translateY(0) rotate(45deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(405deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // ============================================
  // PERFORMANCE MONITORING
  // ============================================
  
  window.addEventListener('load', () => {
    if ('performance' in window) {
      const perfData = performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log(`%c⚡ Page Load Time: ${pageLoadTime}ms`, 'color: #ffd700; font-size: 12px;');
    }
  });

  // ============================================
  // VISIBILITY CHANGE HANDLER
  // ============================================
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('%c💤 Tab is hidden', 'color: #888;');
    } else {
      console.log('%c👀 Tab is visible', 'color: #7cbd52;');
    }
  });

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  
  document.addEventListener('keydown', (e) => {
    // Number keys 1-5 for quick navigation
    if (e.key >= '1' && e.key <= '5') {
      const sections = ['home', 'about', 'skills', 'projects', 'contact'];
      const sectionIndex = parseInt(e.key) - 1;
      const target = document.getElementById(sections[sectionIndex]);
      
      if (target && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        playSound('click');
        const offsetTop = target.offsetTop - 70;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    }
    
    // ESC to close mobile menu
    if (e.key === 'Escape') {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        const icon = document.querySelector('#mobile-toggle i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    }
  });

  // ============================================
  // WINDOW RESIZE HANDLER
  // ============================================
  
  let resizeTimer;
  window.addEventListener('resize', debounce(() => {
    // Regenerate particles on resize
    const container = document.getElementById('particles');
    if (container) {
      container.innerHTML = '';
      generateParticles();
    }
  }, 500));

})();
