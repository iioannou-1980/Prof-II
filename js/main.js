/* ==========================================================================
   Ioannis Ioannou - Main JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('is-active');
            navToggle.classList.toggle('is-active');
            
            // Toggle aria-expanded
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
        });
    }
    
    // Header scroll effect
    const header = document.querySelector('.site-header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.expertise-card, .news-item, .event-item').forEach(el => {
        observer.observe(el);
    });
    
});

// Add mobile menu styles dynamically
const mobileStyles = `
    @media (max-width: 1023px) {
        .nav-menu {
            position: fixed;
            top: 72px;
            left: 0;
            right: 0;
            bottom: 0;
            background: #ffffff;
            flex-direction: column;
            justify-content: flex-start;
            padding: 2rem;
            gap: 1.5rem;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 999;
        }
        
        .nav-menu.is-active {
            display: flex;
            transform: translateX(0);
        }
        
        .nav-menu a {
            font-size: 1.25rem;
        }
        
        .nav-toggle.is-active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav-toggle.is-active span:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.is-active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = mobileStyles;
document.head.appendChild(styleSheet);
