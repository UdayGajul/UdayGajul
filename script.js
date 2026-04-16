// =========================================
// CUSTOM CURSOR LOGIC
// =========================================
const isMobile = window.matchMedia("(max-width: 768px)").matches;

const cursor = document.getElementById('custom-cursor');
const cursorLabel = document.getElementById('custom-cursor-label');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;
let cursorAnimationFrameId = null;
let isCursorAnimationRunning = false;

if (!isMobile) {
    const handleMouseMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    };

    function animateCursor() {
        // Smooth trailing effect
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;

        cursorX += dx * 0.15;
        cursorY += dy * 0.15;

        cursor.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
        if (cursorLabel) {
            cursorLabel.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
        }
        cursorAnimationFrameId = requestAnimationFrame(animateCursor);
    }

    const startCursorAnimation = () => {
        if (isCursorAnimationRunning) return;
        isCursorAnimationRunning = true;
        animateCursor();
    };

    const stopCursorAnimation = () => {
        if (cursorAnimationFrameId !== null) {
            cancelAnimationFrame(cursorAnimationFrameId);
            cursorAnimationFrameId = null;
        }
        isCursorAnimationRunning = false;
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Sync cursor state when returning from another page/tab to avoid visible catch-up lag.
    window.addEventListener('pageshow', () => {
        cursorX = mouseX;
        cursorY = mouseY;
        startCursorAnimation();
    });

    // Pause loop when page is hidden/unloaded to avoid stale animation state.
    window.addEventListener('pagehide', stopCursorAnimation);

    startCursorAnimation();
}

// Hover effect for interactive elements only on desktop
if (!isMobile) {
    const hoverElements = document.querySelectorAll('a, button, .hover-target');
    const cursorText = cursorLabel ? cursorLabel.querySelector('.cursor-text') : null;

    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover-effect');
            if (cursorLabel) cursorLabel.classList.add('hover-effect');
            // Determine what label to show inside the expanded cursor
            if (el.classList.contains('open-btn')) {
                // Any element that opens a new tab
                if (cursorText) cursorText.innerHTML = '<i class="fas fa-arrow-up-right-from-square" style="font-size:24px;"></i>';
            } else if (el.classList.contains('project-btn')) {
                if (el.classList.contains('back-btn')) {
                    // Back button
                    if (cursorText) cursorText.innerText = "BACK";
                } else {
                    // Generic view / project button
                    if (cursorText) cursorText.innerText = "VIEW";
                }
            } else if (el.classList.contains('close-modal')) {
                if (cursorText) {
                    cursorText.innerText = "CLOSE";
                    cursorText.style.fontSize = "12px";
                }
            } else if (el.id === 'hamburger-btn' || el.classList.contains('hamburger-btn')) {
                if (cursorText) {
                    const isActive = el.classList.contains('active');
                    cursorText.innerText = isActive ? "CLOSE" : "MENU";
                    cursorText.style.fontSize = isActive ? "12px" : "14px";
                }
            } else {
                if (cursorText) {
                    cursorText.innerHTML = '';
                    cursorText.style.fontSize = "";
                }
            }
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover-effect');
            if (cursorLabel) cursorLabel.classList.remove('hover-effect');
            if (cursorText) {
                cursorText.innerHTML = '';
                cursorText.style.fontSize = "";
            }
        });
    });
}

// =========================================
// PARALLAX BACKGROUND
// =========================================
const parallaxBg = document.getElementById('parallax-bg');

if (!isMobile) {
    document.addEventListener('mousemove', (e) => {
        // Calculate mouse position relative to center of screen (use clientX/Y to ignore scroll offset)
        const x = (window.innerWidth / 2 - e.clientX) / 50;
        const y = (window.innerHeight / 2 - e.clientY) / 50;

        // Apply slight movement
        parallaxBg.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
}

// =========================================
// CINEMATIC HERO ANIMATION (GSAP)
// =========================================
// Ensure GSAP and ScrollTrigger are registered
gsap.registerPlugin(ScrollTrigger);

const heroTimeline = gsap.timeline({ defaults: { ease: 'power4.out' } });
// Initial Setup
gsap.set('.hero-text-container', { opacity: 1 });

// Spec: start max-zoomed at top (behind), move down smoothly,
// shrink + sharpen into final bottom-left / bottom-right layout.
const startScale = isMobile ? 6.5 : 12;
const startY = isMobile ? '-55vh' : '-75vh';
const startOpacity = isMobile ? 0.22 : 0.18;
const startBlur = isMobile ? 10 : 14;

const glowFilterLow = `blur(0px) drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.8)) drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.35))`;
const glowFilterHigh = `blur(0px) drop-shadow(0px 12px 18px rgba(0, 0, 0, 0.85)) drop-shadow(0px 0px 18px rgba(255, 255, 255, 0.6)) drop-shadow(0px 0px 34px rgba(180, 220, 255, 0.35))`;

gsap.set(['#word-uday', '#word-gajul'], {
    scale: startScale,
    y: startY,
    opacity: startOpacity,
    transformOrigin: 'center center',
    force3D: true
});
gsap.set('#word-uday', { x: 0, rotateZ: -1 });
gsap.set('#word-gajul', { x: 0, rotateZ: 1 });
gsap.set(['#word-uday', '#word-gajul'], { filter: `blur(${startBlur}px) drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.8)) drop-shadow(0px 0px 6px rgba(255, 255, 255, 0.18))` });

// ── Detect if this is a genuine fresh load (including reload) or a back-navigation ──
// Custom Back button → navType is 'navigate' (link click), but returnSection will be set in sessionStorage.
// Browser native Back button → navType is 'back_forward', returnSection may or may not be set.
// Reload → navType is 'reload', returnSection is null → always play animation.
const navType = performance.getEntriesByType('navigation')[0]?.type;
const returnSection = sessionStorage.getItem('returnSection'); // set by project_detail.html on Back click
const isBackNav = returnSection !== null || navType === 'back_forward' || (navType === 'navigate' && window.location.hash !== '');

if (isBackNav) {
    // ── Back navigation: skip animation, jump to the section the user was on ──
    gsap.set(['#word-uday', '#word-gajul'], { opacity: 1, scale: 1, x: 0, y: 0, rotateZ: 0, filter: glowFilterLow });
    const targetHash = returnSection || window.location.hash.replace('#', '');
    if (targetHash) {
        requestAnimationFrame(() => {
            const el = document.getElementById(targetHash);
            if (el) el.scrollIntoView({ behavior: 'instant' });
        });
    }
    sessionStorage.removeItem('returnSection');
} else {
    // ── Fresh load / reload: always play the full hero animation ──
    // Strip the hash from the URL bar so the browser doesn't auto-jump mid-animation
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
    }
    heroTimeline
        .to(['#word-uday', '#word-gajul'], { opacity: 0.45, duration: 0.35, ease: 'power1.inOut' })
        .to(['#word-uday', '#word-gajul'], {
            duration: 2.4,
            y: isMobile ? '-18vh' : '-24vh',
            scale: isMobile ? 2.4 : 3.2,
            filter: isMobile
                ? 'blur(6px) drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.85)) drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.22))'
                : 'blur(7px) drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.85)) drop-shadow(0px 0px 9px rgba(255, 255, 255, 0.22))',
            ease: 'power2.inOut'
        }, '<')
        .to(['#word-uday', '#word-gajul'], {
            duration: 2.2,
            y: 0,
            scale: 1,
            rotateZ: 0,
            opacity: 1,
            filter: glowFilterLow,
            ease: 'power3.inOut'
        }, '>-0.05');
}

function startHeroIdleMotion() {
    // Subtle “alive” motion after settling (slightly more float + gentle glow pulse)
    gsap.to(['#word-uday', '#word-gajul'], {
        duration: 4.8,
        y: isMobile ? -15 : -25,
        rotationX: isMobile ? 0 : 6,
        rotationY: isMobile ? 0 : -6,
        transformOrigin: 'center center',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        overwrite: 'auto'
    });

    gsap.to(['#word-uday', '#word-gajul'], {
        duration: 2.6,
        filter: glowFilterHigh,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        overwrite: 'auto'
    });
}

if (isBackNav) {
    startHeroIdleMotion();
} else {
    heroTimeline.call(startHeroIdleMotion);
}


// =========================================
// ENSURE START AT TOP ON RELOAD (REMOVED FOR ANCHOR SUPPORT)
// =========================================
/*
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};
*/

// =========================================
// SCROLL ANIMATIONS
// =========================================
// Fade Up Elements
const fadeUpElements = gsap.utils.toArray('.fade-up');
fadeUpElements.forEach((el) => {
    gsap.fromTo(el,
        { y: 100, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%", // Trigger animation when element enters 85% of viewport
                toggleActions: "play none none reverse" // Replays animation when scrolling back up
            }
        }
    );
});

// Slide Left Elements
const slideLeftElements = gsap.utils.toArray('.slide-left');
slideLeftElements.forEach((el) => {
    gsap.fromTo(el,
        { x: -150, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// Slide Right Elements
const slideRightElements = gsap.utils.toArray('.slide-right');
slideRightElements.forEach((el) => {
    gsap.fromTo(el,
        { x: 150, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// Slide Up Elements
const slideUpElements = gsap.utils.toArray('.slide-up');
slideUpElements.forEach((el) => {
    gsap.fromTo(el,
        { y: 100, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        }
    );
});

// Reveal Text Animation for "About Me"
const revealTexts = document.querySelectorAll('.reveal-text');
if (revealTexts.length > 0) {
    revealTexts.forEach(revealText => {
        // Split text into characters for a cool reveal
        const textContent = revealText.textContent;
        revealText.innerHTML = '';

        // Wrap each character or word in a span (we'll do words for simplicity and performance)
        const words = textContent.split(' ');
        words.forEach(word => {
            const span = document.createElement('span');
            span.innerHTML = word + '&nbsp;';
            span.style.opacity = 0;
            span.style.display = 'inline-block';
            revealText.appendChild(span);
        });
    });

    // Animate words
    gsap.to('.reveal-text span', {
        opacity: 1,
        y: 0,
        stagger: 0.03, // Reduced from 0.1
        duration: 0.4, // Reduced from 0.5
        ease: "power1.out",
        scrollTrigger: {
            trigger: '.reveal-text',
            start: "top 85%", // Trigger slightly earlier
            toggleActions: "play none none reverse"
        }
    });

    // Initial state
    gsap.set('.reveal-text span', { y: 20 });
}

// =========================================
// CUSTOM SCROLLBAR LOGIC
// =========================================
const scrollbarContainer = document.getElementById('scrollbar-container');
const scrollbarThumb = document.getElementById('scrollbar-thumb');

if (scrollbarContainer && scrollbarThumb && !isMobile) {
    const updateThumb = () => {
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        // Calculate thumb height proportionally
        const containerHeight = scrollbarContainer.offsetHeight;
        let thumbHeight = (winHeight / docHeight) * containerHeight;
        thumbHeight = Math.max(thumbHeight, 40); // Min height
        scrollbarThumb.style.height = `${thumbHeight}px`;

        // Calculate thumb position
        const maxScroll = docHeight - winHeight;
        const maxThumbTop = containerHeight - thumbHeight;
        
        // Handle short pages or division by zero
        const scrollPercentage = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
        
        scrollbarThumb.style.top = `${scrollPercentage * maxThumbTop}px`;
    };

    window.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', updateThumb);
    
    // Initial triggers
    updateThumb();
    window.addEventListener('load', updateThumb);
    setTimeout(updateThumb, 300);
    
    const scrollObserver = new MutationObserver(updateThumb);
    scrollObserver.observe(document.body, { childList: true, subtree: true });

    // Dragging Logic
    let isDragging = false;
    let startYDrag, startScrollTop;

    scrollbarThumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        startYDrag = e.clientY;
        startScrollTop = window.scrollY;
        document.body.style.userSelect = 'none';
        scrollbarThumb.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaY = e.clientY - startYDrag;
        const containerHeight = scrollbarContainer.offsetHeight;
        const thumbHeight = scrollbarThumb.offsetHeight;
        const maxThumbTop = containerHeight - thumbHeight;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        const thumbMovePercentage = deltaY / maxThumbTop;
        const scrollTo = startScrollTop + (thumbMovePercentage * maxScroll);
        
        window.scrollTo(0, scrollTo);
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
            scrollbarThumb.style.cursor = 'grab';
        }
    });

    // Track click to scroll
    scrollbarContainer.addEventListener('mousedown', (e) => {
        if (e.target === scrollbarThumb) return;
        
        const rect = scrollbarContainer.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const thumbHalfHeight = scrollbarThumb.offsetHeight / 2;
        const maxThumbTop = scrollbarContainer.offsetHeight - scrollbarThumb.offsetHeight;
        const clampedThumbTop = Math.max(0, Math.min(clickY - thumbHalfHeight, maxThumbTop));
        
        const scrollPercentage = clampedThumbTop / maxThumbTop;
        const scrollTarget = scrollPercentage * (document.documentElement.scrollHeight - window.innerHeight);
        
        window.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
        });
    });
}

// =========================================
// PREMIUM HAMBURGER NAVIGATION LOGIC
// =========================================
const hamburgerBtn = document.getElementById('hamburger-btn');
const fullScreenMenu = document.getElementById('full-screen-menu');
const menuLinks = document.querySelectorAll('.menu-link');

if (hamburgerBtn && fullScreenMenu) {
    let menuOpen = false;

    const toggleMenu = () => {
        menuOpen = !menuOpen;
        hamburgerBtn.classList.toggle('active');
        fullScreenMenu.classList.toggle('active');

        // Update cursor text instantly if hovering
        const cursorTextEl = document.querySelector('.cursor-text');
        if (cursorTextEl && hamburgerBtn.matches(':hover')) {
            cursorTextEl.innerText = menuOpen ? "CLOSE" : "MENU";
            cursorTextEl.style.fontSize = menuOpen ? "12px" : "14px";
        }

        if (menuOpen) {
            gsap.to('.menu-link', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power4.out',
                delay: 0.2
            });
            document.body.style.overflow = 'hidden';
        } else {
            gsap.to('.menu-link', {
                opacity: 0,
                y: 30,
                duration: 0.4,
                stagger: 0.05,
                ease: 'power2.in'
            });
            document.body.style.overflow = '';
        }
    };

    hamburgerBtn.addEventListener('click', toggleMenu);

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            const isDetailPage = window.location.pathname.includes('_detail.html');

            if (href.startsWith('#')) {
                if (isDetailPage) {
                    // Set returnSection so index.html knows to skip animation and jump to section
                    sessionStorage.setItem('returnSection', href.replace('#', ''));
                    window.location.href = 'index.html' + href;
                } else {
                    e.preventDefault();
                    toggleMenu();
                    const targetId = href.replace('#', '');
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        setTimeout(() => {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                        }, 500); 
                    }
                }
            } else {
                toggleMenu();
            }
        });
    });

    // Custom cursor text for menu links
    const cursorTextEl = document.querySelector('.cursor-text');
    menuLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            if (cursorTextEl) {
                cursorTextEl.innerText = "GO";
                cursorTextEl.style.fontSize = "20px";
            }
        });
        link.addEventListener('mouseleave', () => {
            if (cursorTextEl) {
                cursorTextEl.innerText = "";
            }
        });
    });
}
