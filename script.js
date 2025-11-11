/**
 * Portfolio Website JavaScript (Secure Version)
 * Author: Ditzz
 * Description: Interactive features with security enhancements
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // SECURITY: Input Sanitization Functions
    // ============================================
    
    /**
     * Sanitize user input to prevent XSS attacks
     * @param {string} input - User input string
     * @returns {string} Sanitized string
     */
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
    
    /**
     * Validate email format
     * @param {string} email - Email address
     * @returns {boolean} Valid or not
     */
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // ============================================
    // TYPING EFFECT
    // ============================================
    const typingPhrases = [
        "Web Developer",
        "Backend Enthusiast",
        "UI/UX Designer",
        "Tech Innovator",
        "Creative Coder",
        "AI Engineer"
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeEffect() {
        const currentPhrase = typingPhrases[phraseIndex];
        const typingElement = document.getElementById("typing");
        
        if (!typingElement) return;
        
        // Update text based on typing or deleting state
        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }
        
        // Check if phrase is complete
        if (!isDeleting && charIndex === currentPhrase.length) {
            // Pause before deleting
            setTimeout(() => {
                isDeleting = true;
                typeEffect();
            }, 2500);
            return;
        }
        
        // Check if deletion is complete
        if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % typingPhrases.length;
            setTimeout(typeEffect, 700);
            return;
        }
        
        // Continue typing/deleting with appropriate speed
        const speed = isDeleting ? 30 : 100;
        setTimeout(typeEffect, speed);
    }
    
    // Start typing effect
    typeEffect();
    
    // ============================================
    // FORM VALIDATION & SECURITY
    // ============================================
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Get form inputs
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            // Sanitize inputs
            const sanitizedName = sanitizeInput(nameInput.value.trim());
            const sanitizedEmail = emailInput.value.trim().toLowerCase();
            const sanitizedMessage = sanitizeInput(messageInput.value.trim());
            
            // Validate inputs
            if (sanitizedName.length < 2) {
                e.preventDefault();
                alert('Please enter a valid name (at least 2 characters)');
                return false;
            }
            
            if (!validateEmail(sanitizedEmail)) {
                e.preventDefault();
                alert('Please enter a valid email address');
                return false;
            }
            
            if (sanitizedMessage.length < 10) {
                e.preventDefault();
                alert('Please enter a message (at least 10 characters)');
                return false;
            }
            
            // Update form values with sanitized data
            nameInput.value = sanitizedName;
            emailInput.value = sanitizedEmail;
            messageInput.value = sanitizedMessage;
            
            // Log form submission (for debugging)
            console.log('Form submitted successfully');
        });
    }
    
    // ============================================
    // SMOOTH SCROLL FOR NAVIGATION
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 64; // Navbar height
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
            
            // Close mobile menu after click
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                
                const mobileMenuButton = document.getElementById('mobile-menu-button');
                if (mobileMenuButton) {
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
    
    // ============================================
    // MOBILE MENU TOGGLE
    // ============================================
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
        });
    }
    
    // ============================================
    // SCROLL REVEAL FOR SECTIONS
    // ============================================
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // ============================================
    // PARTICLES GENERATOR
    // ============================================
    const particlesContainer = document.getElementById('particles-container');
    const numParticles = 20;
    
    if (particlesContainer) {
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random size between 5px and 10px
            const size = Math.random() * 5 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random horizontal position
            particle.style.left = `${Math.random() * 100}%`;
            
            // Random animation duration and delay
            particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
            particle.style.animationDelay = `-${Math.random() * 10}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    // ============================================
    // BACK TO TOP BUTTON
    // ============================================
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', throttle(() => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        }, 100));
        
        // Scroll to top on click
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // ============================================
    // RIPPLE EFFECT FOR BUTTONS
    // ============================================
    document.querySelectorAll('.glow-button, button').forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.width = '10px';
            ripple.style.height = '10px';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 1200);
        });
    });
    
    // ============================================
    // PARALLAX EFFECT FOR HOME BACKGROUND
    // ============================================
    const heroSection = document.querySelector('#home');
    const heroBackground = heroSection ? heroSection.querySelector('img') : null;
    
    if (heroBackground) {
        window.addEventListener('scroll', throttle(() => {
            const scrollPos = window.scrollY;
            
            // Only apply parallax when hero is visible
            if (scrollPos < window.innerHeight) {
                heroBackground.style.transform = `translateY(${scrollPos * 0.5}px) scale(1.15)`;
            }
        }, 16)); // ~60fps
    }
    
    // ============================================
    // NAVBAR HIDE/SHOW ON SCROLL
    // ============================================
    const nav = document.querySelector('nav');
    let lastScroll = 0;
    const scrollThreshold = 120;
    
    if (nav) {
        window.addEventListener('scroll', throttle(() => {
            const currentScroll = window.scrollY;
            
            // Hide navbar when scrolling down, show when scrolling up
            if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        }, 100));
    }
    
    // ============================================
    // PREVENT RIGHT CLICK ON IMAGES (Optional Security)
    // ============================================
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
    });
    
    // ============================================
    // CONSOLE MESSAGE
    // ============================================
    console.log('%c🔒 Security Enabled', 'color: #10b981; font-size: 16px; font-weight: bold;');
    console.log('%c👋 Hello Developer!', 'color: #60a5fa; font-size: 20px; font-weight: bold;');
    console.log('%cInterested in the code? Check out my GitHub: https://github.com/Always-Ditz', 'color: #93c5fd; font-size: 14px;');
    console.log('%c💼 Looking for a developer? Let\'s connect!', 'color: #3b82f6; font-size: 14px;');
    console.log('%c⚠️ Warning: Do not paste unknown code here!', 'color: #ef4444; font-size: 12px; font-weight: bold;');
    
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
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

/**
 * Debounce function to delay function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
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
// SECURITY: Prevent Console Tampering
// ============================================
(function() {
    'use strict';
    
    // Disable common developer shortcuts in production
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        document.addEventListener('keydown', function(e) {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'U')
            ) {
                e.preventDefault();
                console.warn('Developer tools are disabled in production mode.');
                return false;
            }
        });
    }
})();