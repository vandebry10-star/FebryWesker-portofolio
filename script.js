/**
 * Portfolio Website JavaScript (Secure Version)
 * Author: FebryWesker (Azbry)
 * Description: Interactive features with security enhancements
 */

document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // SECURITY: Input Sanitization Functions
    // ============================================
    
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ============================================
    // TYPING EFFECT (Azbry Edition)
    // ============================================
    const typingPhrases = [
        "Web Game Developer",
        "WhatsApp Bot Creator",
        "UI/UX Neon Designer",
        "Fast & Minimalist Dev",
        "Azbry Project Owner",
        "FebryWesker on GitHub"
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function typeEffect() {
        const currentPhrase = typingPhrases[phraseIndex];
        const typingElement = document.getElementById("typing");
        if (!typingElement) return;

        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            setTimeout(() => { isDeleting = true; typeEffect(); }, 2500);
            return;
        }

        if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % typingPhrases.length;
            setTimeout(typeEffect, 700);
            return;
        }

        const speed = isDeleting ? 35 : 95;
        setTimeout(typeEffect, speed);
    }
    typeEffect();

    // ============================================
    // FORM VALIDATION & SECURITY
    // ============================================
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            const sanitizedName = sanitizeInput(nameInput.value.trim());
            const sanitizedEmail = emailInput.value.trim().toLowerCase();
            const sanitizedMessage = sanitizeInput(messageInput.value.trim());

            if (sanitizedName.length < 2) {
                e.preventDefault();
                alert('Masukkan nama minimal 2 karakter.');
                return false;
            }

            if (!validateEmail(sanitizedEmail)) {
                e.preventDefault();
                alert('Masukkan alamat email yang valid.');
                return false;
            }

            if (sanitizedMessage.length < 10) {
                e.preventDefault();
                alert('Pesan minimal 10 karakter.');
                return false;
            }

            nameInput.value = sanitizedName;
            emailInput.value = sanitizedEmail;
            messageInput.value = sanitizedMessage;

            console.log('Form submitted successfully (Azbry Portfolio)');
        });
    }

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 64;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }

            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                const mobileMenuButton = document.getElementById('mobile-menu-button');
                if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // ============================================
    // MOBILE MENU
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
    // SCROLL REVEAL
    // ============================================
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => sectionObserver.observe(section));

    // ============================================
    // PARTICLES
    // ============================================
    const particlesContainer = document.getElementById('particles-container');
    if (particlesContainer) {
        for (let i = 0; i < 25; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            const size = Math.random() * 5 + 5;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.left = `${Math.random() * 100}%`;
            p.style.animationDuration = `${Math.random() * 10 + 10}s`;
            p.style.animationDelay = `-${Math.random() * 10}s`;
            particlesContainer.appendChild(p);
        }
    }

    // ============================================
    // BACK TO TOP BUTTON
    // ============================================
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', throttle(() => {
            backToTopButton.classList.toggle('visible', window.scrollY > 300);
        }, 100));

        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================
    // RIPPLE EFFECT
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
            setTimeout(() => ripple.remove(), 1200);
        });
    });

    // ============================================
    // PARALLAX EFFECT
    // ============================================
    const heroSection = document.querySelector('#home');
    const heroBackground = heroSection ? heroSection.querySelector('img') : null;
    if (heroBackground) {
        window.addEventListener('scroll', throttle(() => {
            const scrollPos = window.scrollY;
            if (scrollPos < window.innerHeight) {
                heroBackground.style.transform = `translateY(${scrollPos * 0.5}px) scale(1.15)`;
            }
        }, 16));
    }

    // ============================================
    // NAVBAR HIDE/SHOW
    // ============================================
    const nav = document.querySelector('nav');
    let lastScroll = 0;
    if (nav) {
        window.addEventListener('scroll', throttle(() => {
            const currentScroll = window.scrollY;
            nav.style.transform = (currentScroll > lastScroll && currentScroll > 120)
                ? 'translateY(-100%)' : 'translateY(0)';
            lastScroll = currentScroll;
        }, 100));
    }

    // ============================================
    // DISABLE RIGHT-CLICK ON IMAGES
    // ============================================
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('contextmenu', e => e.preventDefault());
    });

    // ============================================
    // CONSOLE MESSAGE (Azbry Version)
    // ============================================
    console.log('%c🌐 Azbry Portfolio', 'color:#b8ff9a;font-size:18px;font-weight:bold;');
    console.log('%c⚡ Developer: FebryWesker', 'color:#a0ffc0;font-size:16px;font-weight:bold;');
    console.log('%c🧩 Projects: Azbry Minigame & Azbry-MD', 'color:#d0ffbf;font-size:14px;');
    console.log('%c🔗 GitHub: https://github.com/FebryWesker', 'color:#94ef89;font-size:14px;');
    console.log('%c⚠️ Warning: Jangan tempel kode asing di sini!', 'color:#ef4444;font-size:12px;font-weight:bold;');
});

// ============================================
// UTILITIES
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
// SECURITY: Disable DevTools in Production
// ============================================
(function() {
    const isProduction = window.location.hostname !== 'localhost' && 
                        window.location.hostname !== '127.0.0.1';
    if (isProduction) {
        document.addEventListener('keydown', function(e) {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'U')
            ) {
                e.preventDefault();
                console.warn('Developer tools disabled in production (Azbry Security).');
                return false;
            }
        });
    }
})();
