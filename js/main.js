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
            
            // Directly set background when menu is active
            if (navMenu.classList.contains('is-active')) {
                navMenu.style.backgroundColor = '#ffffff';
                navMenu.style.background = '#ffffff';
            }
            
            // Toggle aria-expanded
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
        });
        
        // Set initial mobile menu styles via JavaScript
        if (window.innerWidth < 1024) {
            navMenu.style.cssText = `
                display: flex;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #ffffff;
                background-color: #ffffff;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 2rem;
                gap: 2rem;
                z-index: 99999;
                visibility: hidden;
                opacity: 0;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            `;
        }
    }
    
    // Override is-active class behavior
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 1023px) {
            .nav-menu.is-active {
                visibility: visible !important;
                opacity: 1 !important;
                background: #ffffff !important;
                background-color: #ffffff !important;
            }
        }
    `;
    document.head.appendChild(style);
    
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
