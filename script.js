// =========================================
// CUSTOM CURSOR LOGIC
// =========================================
const isMobile = window.matchMedia("(max-width: 768px)").matches;

const cursor = document.getElementById('custom-cursor');
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
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

// Hover effect for interactive elements only on desktop
if (!isMobile) {
    const hoverElements = document.querySelectorAll('a, button');
    const cursorText = cursor.querySelector('.cursor-text');
    
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover-effect');
            // If it's a project button or download button, show "VIEW"
            if (el.classList.contains('project-btn') || el.classList.contains('download-btn')) {
                // Check if it's the back button specifically
                if (el.classList.contains('back-btn')) {
                    cursorText.innerText = "BACK";
                } else {
                    cursorText.innerText = "VIEW";
                }
            } else {
                cursorText.innerText = "";
            }
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover-effect');
            cursorText.innerText = "";
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
// On mobile, use a slightly softer scale and push them top/bottom instead of left/right to fit portrait view
const startScale = isMobile ? 8 : 15;
const startXLeft = isMobile ? '0vw' : '-150vw';
const startXRight = isMobile ? '0vw' : '150vw';
const startYTop = isMobile ? '-50vh' : '0';
const startYBottom = isMobile ? '50vh' : '0';


gsap.set('#word-uday', {
    scale: startScale,
    x: startXLeft,
    y: startYTop,
    opacity: 0,
    transformOrigin: 'center center',
    force3D: true
});
gsap.set('#word-gajul', {
    scale: startScale,
    x: startXRight,
    y: startYBottom,
    opacity: 0,
    transformOrigin: 'center center',
    force3D: true
});

// Main entrance sequence
if (window.location.hash) {
    // Skip animation if arriving via hash (like #projects)
    gsap.set(['#word-uday', '#word-gajul'], { opacity: 1, scale: 1, x: 0, y: 0 });
    // Still start the floating animation
    gsap.to(['#word-uday', '#word-gajul'], {
        duration: 2.5,
        rotationX: 8,
        rotationY: -8,
        transformOrigin: 'center center',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });
} else {
    heroTimeline
        // Fade/scale in from opposite sides
        .to(['#word-uday', '#word-gajul'], { opacity: 1, duration: 0.6 })
        .to('#word-uday', { scale: 1, x: 0, y: 0, duration: 5, autoRound: false }, '<')
        .to('#word-gajul', { scale: 1, x: 0, y: 0, duration: 5, autoRound: false }, '<')
        // Subtle overshoot bounce for both words
        .to('#word-uday', { y: -12, duration: 0.4, ease: 'power2.out' }, '-=1.2')
        .to('#word-uday', { y: 0, duration: 0.6, ease: 'bounce.out' }, '>-0.1')
        .to('#word-gajul', { y: 12, duration: 0.4, ease: 'power2.out' }, '<')
        .to('#word-gajul', { y: 0, duration: 0.6, ease: 'bounce.out' }, '>-0.1')
        // Micro rotation + glow pulse for a premium glassy feel
        .to(['#word-uday', '#word-gajul'], {
            duration: 2.5,
            rotationX: 8,
            rotationY: -8,
            transformOrigin: 'center center',
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        }, '+=0.4');
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
