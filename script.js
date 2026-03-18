// =========================================
// CUSTOM CURSOR LOGIC
// =========================================
const isMobile = window.matchMedia("(max-width: 768px)").matches;

const cursor = document.getElementById('custom-cursor');
const cursorLabel = document.getElementById('custom-cursor-label');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;

if (!isMobile) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

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
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

// Hover effect for interactive elements only on desktop
if (!isMobile) {
    const hoverElements = document.querySelectorAll('a, button');
    const cursorText = cursorLabel ? cursorLabel.querySelector('.cursor-text') : null;
    
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover-effect');
            if (cursorLabel) cursorLabel.classList.add('hover-effect');
            // Determine what label to show inside the expanded cursor
            if (el.classList.contains('open-btn')) {
                // Any element that opens a new tab
                if (cursorText) cursorText.innerHTML = '<i class="fas fa-arrow-up-right-from-square" style="font-size:24px;"></i>';
            } else if (el.classList.contains('project-btn') || el.classList.contains('download-btn')) {
                if (el.classList.contains('back-btn')) {
                    // Back button
                    if (cursorText) cursorText.innerText = "BACK";
                } else {
                    // Generic view / project button
                    if (cursorText) cursorText.innerText = "VIEW";
                }
            } else {
                if (cursorText) cursorText.innerHTML = '';
            }
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover-effect');
            if (cursorLabel) cursorLabel.classList.remove('hover-effect');
            if (cursorText) cursorText.innerHTML = '';
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

// Main entrance sequence
if (window.location.hash) {
    // Skip intro animation if arriving via hash (like #projects)
    gsap.set(['#word-uday', '#word-gajul'], { opacity: 1, scale: 1, x: 0, y: 0, rotateZ: 0, filter: glowFilterLow });
} else {
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
        duration: 4.4,
        y: isMobile ? -7 : -10,
        rotationX: isMobile ? 0 : 4,
        rotationY: isMobile ? 0 : -4,
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

if (window.location.hash) {
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
if(revealTexts.length > 0) {
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
