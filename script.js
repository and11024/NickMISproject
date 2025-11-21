// Professional Portfolio JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Animate hamburger bars
            const bars = hamburger.querySelectorAll('.bar');
            if (hamburger.classList.contains('active')) {
                bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });

        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                
                // Reset hamburger bars
                const bars = hamburger.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target) || hamburger.contains(event.target);
            
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                
                // Reset hamburger bars
                const bars = hamburger.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove background blur based on scroll position
        if (scrollTop > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
        }

        // Hide/show navbar on scroll (optional)
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    const animatedElements = document.querySelectorAll('.about-content, .profile-card, .link-card, .expertise-list li');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add hover effects for expertise cards
    const expertiseCards = document.querySelectorAll('.expertise-list li');
    expertiseCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderLeftColor = '#e67e22';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.borderLeftColor = '#3498db';
        });
    });

    // Profile status indicator
    const statusIndicator = document.querySelector('.status-indicator');
    if (statusIndicator) {
        // Simulate different statuses based on time of day
        const hour = new Date().getHours();
        let status = 'Available for opportunities';
        let statusColor = '#27ae60';
        
        if (hour < 9 || hour > 17) {
            status = 'Available for messages';
            statusColor = '#f39c12';
        }
        
        statusIndicator.style.background = statusColor;
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = status;
        }
    }

    // Add loading animation for external links
    const externalLinks = document.querySelectorAll('a[href$=".pdf"], a[href^="mailto:"], a[href^="tel:"]');
    externalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.href.includes('.pdf')) {
                // Add visual feedback for PDF downloads
                const originalText = this.innerHTML;
                this.innerHTML = '📄 Opening Resume...';
                this.style.opacity = '0.7';
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.opacity = '1';
                }, 2000);
            }
        });
    });

    // Console message for developers
    console.log('%c👋 Hi there! Thanks for checking out the code.', 'color: #2c3e50; font-size: 14px; font-weight: bold;');
    console.log('%cThis portfolio was built with modern web technologies.', 'color: #7f8c8d; font-size: 12px;');
});

// Utility function to format text
function formatText(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Function to update page title with animation
function updatePageTitle(title) {
    const titleElement = document.querySelector('title');
    if (titleElement) {
        const currentTitle = titleElement.textContent;
        titleElement.textContent = title;
        
        // Add a subtle animation effect
        titleElement.style.opacity = '0';
        setTimeout(() => {
            titleElement.style.opacity = '1';
        }, 100);
    }
}
