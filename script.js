/**
 * ARBVERSE - Main JavaScript
 * Handles navigation, price fetching, form submission, and animations
 */

// ========================================
// Navigation
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initContactForm();
    
    // Initialize price fetching only on prices page
    if (document.getElementById('priceGrid')) {
        fetchPrices();
        // Auto-refresh every 60 seconds
        setInterval(fetchPrices, 60000);
    }
});

function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// ========================================
// Scroll Effects & Animations
// ========================================

function initScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.glass-card, .section-header, .hero-content'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// Contact Form
// ========================================

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = `
            <span>Sending...</span>
            <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
        `;
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Show success state
        submitBtn.innerHTML = `
            <span>Message Sent!</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
        `;
        submitBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc6a)';

        // Reset form
        form.reset();

        // Reset button after delay
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 3000);
    });
}

// ========================================
// Crypto Price Fetching
// ========================================

const COINGECKO_API = "https://api.coingecko.com/api/v3";

async function fetchPrices() {

    const loadingState = document.getElementById("loadingState");
    const errorState = document.getElementById("errorState");
    const priceGrid = document.getElementById("priceGrid");
    const marketStats = document.getElementById("marketStats");
    const refreshBtn = document.getElementById("refreshBtn");

    if (!priceGrid) return;

    try {

        if (loadingState) loadingState.style.display = "flex";
        if (errorState) errorState.style.display = "none";

        if (refreshBtn) {
            refreshBtn.disabled = true;
        }

        const response = await fetch(
            `${COINGECKO_API}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true`
        );

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        updatePriceCard("btc", {
            price: data.bitcoin.usd,
            change: data.bitcoin.usd_24h_change
        });

        updatePriceCard("eth", {
            price: data.ethereum.usd,
            change: data.ethereum.usd_24h_change
        });

        if (loadingState) loadingState.style.display = "none";
        if (priceGrid) priceGrid.style.display = "grid";
        if (marketStats) marketStats.style.display = "block";

    } catch(error) {

        console.error(error);

        if (loadingState) loadingState.style.display = "none";

        if (errorState) {
            errorState.style.display = "block";
        }

    } finally {

        if (refreshBtn) {
            refreshBtn.disabled = false;
        }
    }
}

function updatePriceCard(symbol, data) {
    const priceEl = document.getElementById(`${symbol}Price`);
    const changeEl = document.getElementById(`${symbol}Change`);
    const changeValueEl = document.getElementById(`${symbol}ChangeValue`);
    
    if (!priceEl || !changeEl) return;

    // Format price
    const formattedPrice = formatPrice(data.price);
    priceEl.textContent = formattedPrice;

    // Format and display change
    const changePercent = data.change.toFixed(2);
    const isPositive = data.change >= 0;
    
    changeEl.className = `price-change ${isPositive ? 'positive' : 'negative'}`;
    changeEl.innerHTML = `
        <span class="change-arrow">${isPositive ? '↑' : '↓'}</span>
        <span class="change-value">${Math.abs(changePercent)}%</span>
    `;

    if (changeValueEl) {
        const priceChange = (data.price * data.change / 100);
        changeValueEl.textContent = `${isPositive ? '+' : ''}$${formatPrice(Math.abs(priceChange))}`;
        changeValueEl.style.color = isPositive ? 'var(--accent-green)' : 'var(--accent-red)';
    }
}

function updateMarketStats(btcPrice, ethPrice) {
    const ethRatio = document.getElementById('ethRatio');
    const btcDominance = document.getElementById('btcDominance');
    
    if (ethRatio) {
        const ratio = (ethPrice / btcPrice).toFixed(4);
        ethRatio.textContent = ratio;
    }
    
    if (btcDominance) {
        // This is a simplified approximation
        // In production, you'd fetch actual market cap data
        btcDominance.textContent = '~52%';
    }
}

function formatPrice(price) {
    if (price >= 1000) {
        return price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else if (price >= 1) {
        return price.toFixed(2);
    } else {
        return price.toFixed(4);
    }
}

// Manual refresh button handler
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchPrices);
    }
});

// Make fetchPrices available globally for retry button
window.fetchPrices = fetchPrices;

// ========================================
// Utility Functions
// ========================================

// Debounce function for performance
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

// Throttle function for scroll events
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
