// ==========================================
// INTRO CANVAS — DEEP SPACE SCENE
// ==========================================
(function initIntroCanvas() {
    const canvas = document.getElementById('introCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, stars = [], animId, tick = 0;
    let speed = 3;
    let targetSpeed = 3;
    let warping = false;

    window.triggerWarpJump = function(onComplete) {
        warping = true;
        targetSpeed = 80;
        setTimeout(() => { if (onComplete) onComplete(); }, 1200);
    };

    // --- Constellation data (relative 0-1 coords) ---
    const CONSTELLATIONS = [
        { pts: [[0.08,0.12],[0.12,0.18],[0.09,0.25],[0.14,0.22],[0.18,0.15]], lines: [[0,1],[1,2],[1,3],[3,4]] },
        { pts: [[0.80,0.10],[0.85,0.16],[0.82,0.22],[0.88,0.20],[0.91,0.13]], lines: [[0,1],[1,2],[1,3],[3,4],[0,4]] },
        { pts: [[0.70,0.75],[0.75,0.68],[0.80,0.72],[0.78,0.80],[0.72,0.82]], lines: [[0,1],[1,2],[2,3],[3,4],[4,0]] },
        { pts: [[0.15,0.70],[0.20,0.65],[0.25,0.70],[0.22,0.78]], lines: [[0,1],[1,2],[2,3],[3,0]] }
    ];

    // --- Shooting star state ---
    let shootingStar = null;
    let shootingStarTimer = 0;

    function spawnShootingStar() {
        const edge = Math.random();
        shootingStar = {
            x: Math.random() * W * 0.6 + W * 0.1,
            y: Math.random() * H * 0.4,
            vx: (Math.random() * 4 + 3) * (Math.random() > 0.5 ? 1 : -1),
            vy: Math.random() * 3 + 2,
            len: Math.random() * 120 + 80,
            alpha: 1,
            life: 0
        };
    }

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }

    function makeStar() {
        return {
            x: (Math.random() - 0.5) * W,
            y: (Math.random() - 0.5) * H,
            z: Math.random() * W,
            pz: 0
        };
    }

    function init() {
        resize();
        stars = Array.from({ length: 350 }, makeStar);
    }

    function drawSpaceBackground() {
        if (warping) return; // Skip during warp

        // --- Nebula clouds ---
        const nebulaColors = [
            { x: W * 0.15, y: H * 0.3, r: W * 0.25, c1: 'rgba(79,70,229,0.07)', c2: 'rgba(79,70,229,0)' },
            { x: W * 0.82, y: H * 0.6, r: W * 0.2,  c1: 'rgba(14,165,233,0.06)', c2: 'rgba(14,165,233,0)' },
            { x: W * 0.5,  y: H * 0.1, r: W * 0.18, c1: 'rgba(168,85,247,0.05)', c2: 'rgba(168,85,247,0)' },
            { x: W * 0.3,  y: H * 0.8, r: W * 0.15, c1: 'rgba(20,184,166,0.05)', c2: 'rgba(20,184,166,0)' }
        ];
        nebulaColors.forEach(n => {
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
            g.addColorStop(0, n.c1);
            g.addColorStop(1, n.c2);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(n.x, n.y, n.r, n.r * 0.6, Math.sin(tick * 0.001) * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });

        // --- Planet ---
        const px = W * 0.85, py = H * 0.2, pr = Math.min(W, H) * 0.055;
        // Planet glow
        const planetGlow = ctx.createRadialGradient(px, py, pr * 0.5, px, py, pr * 2.5);
        planetGlow.addColorStop(0, 'rgba(79,70,229,0.12)');
        planetGlow.addColorStop(1, 'rgba(79,70,229,0)');
        ctx.fillStyle = planetGlow;
        ctx.beginPath();
        ctx.arc(px, py, pr * 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Planet body
        const planetBody = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, pr * 0.1, px, py, pr);
        planetBody.addColorStop(0, '#6366f1');
        planetBody.addColorStop(0.5, '#4338ca');
        planetBody.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = planetBody;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
        // Planet ring
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(-0.4);
        ctx.scale(1, 0.3);
        ctx.strokeStyle = 'rgba(139,130,255,0.35)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, pr * 1.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(139,130,255,0.15)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(0, 0, pr * 2.1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // --- Constellations ---
        CONSTELLATIONS.forEach(con => {
            const pts = con.pts.map(p => [p[0] * W, p[1] * H]);
            // Lines
            ctx.strokeStyle = 'rgba(180,190,255,0.12)';
            ctx.lineWidth = 0.8;
            con.lines.forEach(([a, b]) => {
                ctx.beginPath();
                ctx.moveTo(pts[a][0], pts[a][1]);
                ctx.lineTo(pts[b][0], pts[b][1]);
                ctx.stroke();
            });
            // Dots
            pts.forEach(([x, y]) => {
                ctx.fillStyle = `rgba(200,210,255,${0.4 + Math.sin(tick * 0.02) * 0.1})`;
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // --- Shooting Star ---
        shootingStarTimer++;
        if (shootingStarTimer > 260 && !shootingStar) {
            spawnShootingStar();
            shootingStarTimer = 0;
        }
        if (shootingStar) {
            const s = shootingStar;
            s.life++;
            s.x += s.vx;
            s.y += s.vy;
            s.alpha = 1 - s.life / 40;
            const tailX = s.x - (s.vx / Math.hypot(s.vx, s.vy)) * s.len;
            const tailY = s.y - (s.vy / Math.hypot(s.vx, s.vy)) * s.len;
            const sg = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
            sg.addColorStop(0, `rgba(255,255,255,0)`);
            sg.addColorStop(1, `rgba(255,255,255,${s.alpha * 0.9})`);
            ctx.strokeStyle = sg;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(s.x, s.y);
            ctx.stroke();
            if (s.alpha <= 0 || s.x > W + 100 || s.y > H + 100) shootingStar = null;
        }
    }

    function draw() {
        tick++;
        speed += (targetSpeed - speed) * 0.06;
        const trailAlpha = warping ? 0.35 : 0.12;
        ctx.fillStyle = `rgba(0,0,0,${trailAlpha})`;
        ctx.fillRect(0, 0, W, H);

        // Draw deep space elements behind stars
        drawSpaceBackground();

        const cx = W / 2, cy = H / 2;
        stars.forEach(s => {
            s.pz = s.z;
            s.z -= speed;
            if (s.z <= 0) {
                s.x = (Math.random() - 0.5) * W;
                s.y = (Math.random() - 0.5) * H;
                s.z = W; s.pz = W;
            }
            const px  = (s.x / s.z)  * W + cx;
            const py  = (s.y / s.z)  * H + cy;
            const ppx = (s.x / s.pz) * W + cx;
            const ppy = (s.y / s.pz) * H + cy;
            const t = 1 - s.z / W;
            const size = Math.max(0.4, t * 3);
            const alpha = Math.min(1, t * 1.2);
            if (warping) {
                const g = ctx.createLinearGradient(ppx, ppy, px, py);
                g.addColorStop(0, `rgba(150,180,255,0)`);
                g.addColorStop(1, `rgba(220,235,255,${alpha})`);
                ctx.strokeStyle = g;
                ctx.lineWidth = size * 1.5;
            } else {
                ctx.strokeStyle = `rgba(180,200,255,${alpha * 0.7})`;
                ctx.lineWidth = size;
            }
            ctx.beginPath();
            ctx.moveTo(ppx, ppy);
            ctx.lineTo(px, py);
            ctx.stroke();
        });

        if (warping && speed > 50) {
            const flashAlpha = Math.min(0.7, (speed - 50) / 35);
            ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
            ctx.fillRect(0, 0, W, H);
        }

        animId = requestAnimationFrame(draw);
    }

    window.addEventListener('load', () => {
        init();
        draw();
        window.addEventListener('resize', init);
    });
})();

// ==========================================
// PREMIUM CINEMATIC INTRO LOGIC
// ==========================================
window.addEventListener('load', () => {
    const introScreen = document.getElementById('intro-screen');
    const introWord = document.getElementById('intro-word');
    const introLogo = document.getElementById('intro-logo');
    const introProgress = document.getElementById('intro-progress');
    const introIcon = document.getElementById('intro-icon');
    const introResonance = document.getElementById('intro-resonance');
    if (!introScreen) return;

    // Skip words/icons and show logo reveal immediately
    finishIntro();


    function finishIntro() {
        // Show logo immediately
        if(introLogo) {
            introLogo.classList.add('show');
        }
        
        // Show swipe bar after logo appears
        setTimeout(() => {
            const swipeBar = document.getElementById('introSwipeBar');
            if(swipeBar) swipeBar.classList.add('show');
            setupIntroSwipe();
        }, 1200);
    }

    function setupIntroSwipe() {
        const swipeBar = document.getElementById('introSwipeBar');
        const swipeThumb = document.getElementById('introSwipeThumb');
        const swipeText = document.getElementById('introSwipeText');
        if (!swipeBar || !swipeThumb) return;

        let isDragging = false, startX = 0;

        const getMaxDrag = () => swipeBar.offsetWidth - swipeThumb.offsetWidth - 8;

        const onStart = (e) => {
            isDragging = true;
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            swipeThumb.style.transition = 'none';
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const maxDrag = getMaxDrag();
            const delta = Math.max(0, Math.min(currentX - startX, maxDrag));
            swipeThumb.style.left = delta + 'px';
            if (swipeText) swipeText.style.opacity = 1 - (delta / maxDrag) * 0.8;

            if (delta >= maxDrag * 0.92) {
                isDragging = false;
                swipeThumb.innerHTML = '✔';

                // 🚀 TRIGGER WARP JUMP
                if (typeof window.triggerWarpJump === 'function') {
                    window.triggerWarpJump(() => {
                        // Smooth zoom-into-page reveal
                        if(introScreen) {
                            introScreen.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                            introScreen.style.opacity = '0';
                            introScreen.style.transform = 'scale(1.5)';
                        }
                        // Fade-in the page content
                        document.body.classList.add('content-reveal');
                        setTimeout(() => {
                            if(introScreen) introScreen.style.display = 'none';
                            document.body.style.overflow = 'auto';
                        }, 800);
                    });
                } else {
                    setTimeout(() => {
                        if(introScreen) { introScreen.style.opacity = '0'; introScreen.style.display = 'none'; }
                        document.body.style.overflow = 'auto';
                    }, 400);
                }
            }
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            swipeThumb.style.transition = 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            swipeThumb.style.left = '0px';
            if (swipeText) swipeText.style.opacity = '1';
        };

        swipeThumb.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        swipeThumb.addEventListener('touchstart', onStart, { passive: true });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    }

    // Lock scroll during intro
    document.body.style.overflow = 'hidden';
});

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // CURSOR GLOW (Desktop only)
    // ==========================================
    const cursorGlow = document.getElementById('cursorGlow');
    if (cursorGlow && window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        });
    }

    // ==========================================
    // PARTICLES
    // ==========================================
    const canvas = document.getElementById('particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const PARTICLE_COUNT = 60;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(108, 92, 231, ${this.opacity * 1.5})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(108, 92, 231, ${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ==========================================
    // NAVBAR SCROLL
    // ==========================================
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // ==========================================
    // MOBILE MENU
    // ==========================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            hamburger.classList.toggle('active');
        });
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                hamburger.classList.remove('active');
            });
        });
    }

    // ==========================================
    // SMOOTH SCROLL
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ==========================================
    // ACTIVE NAV LINK ON SCROLL
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // ==========================================
    // COUNTER ANIMATION
    // ==========================================
    const counters = document.querySelectorAll('.stat-num');
    let counterDone = false;

    function animateCounters() {
        if (counterDone) return;
        const heroStats = document.querySelector('.hero-stats');
        if (!heroStats) return;
        const rect = heroStats.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            counterDone = true;
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        counter.textContent = target;
                        clearInterval(timer);
                    } else {
                        counter.textContent = Math.floor(current);
                    }
                }, 16);
            });
        }
    }

    window.addEventListener('scroll', animateCounters);
    animateCounters(); // Check on load

    // ==========================================
    // REVEAL ON SCROLL
    // ==========================================
    const revealElements = document.querySelectorAll('.s-card, .work-card, .about-layout, .contact-layout, .cta-content');
    revealElements.forEach(el => el.classList.add('reveal-up'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

    // ==========================================
    // TILT EFFECT ON CARDS
    // ==========================================
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const midX = rect.width / 2;
            const midY = rect.height / 2;
            const rotateX = ((y - midY) / midY) * -5;
            const rotateY = ((x - midX) / midX) * 5;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ==========================================
    // CONTACT FORM
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect form data
            const name = document.getElementById('name')?.value || 'Guest';
            const email = document.getElementById('email')?.value || 'No Email';
            const subject = document.getElementById('subject')?.value || 'No Subject';
            const message = document.getElementById('message')?.value || 'No Message';
            
            // Send to Firebase Database (Real-Time)
            if (typeof window.submitContactToFirebase === 'function') {
                window.submitContactToFirebase(name, email, subject, message);
            }
            
            // Save to localStorage (Local Activity Log only)
            const count = parseInt(localStorage.getItem('so_contact_count') || '0') + 1;
            localStorage.setItem('so_contact_count', count);
            
            const log = JSON.parse(localStorage.getItem('so_activity_log') || '[]');
            const richMessage = `<strong>Name:</strong> ${name}<br><strong>Email:</strong> ${email}<br><strong>Subject:</strong> ${subject}<br><br><strong>Message:</strong><br>${message.replace(/\\n/g, '<br>')}`;
            
            log.unshift({ type: 'success', msg: `Contact form submitted by ${name} - ${subject}<br><div style="margin-top:8px;padding:10px;background:rgba(0,0,0,0.2);border-radius:8px;border-left:3px solid var(--accent)">${richMessage}</div>`, ts: Date.now() });
            if (log.length > 50) log.length = 50; 
            localStorage.setItem('so_activity_log', JSON.stringify(log));

            // UI feedback
            const btn = contactForm.querySelector('button[type="submit"] span');
            if(btn) btn.textContent = 'Message Sent! ✓';
            setTimeout(() => {
                if(btn) btn.textContent = 'Send Message';
                contactForm.reset();
            }, 3000);
        });
    }

    // ==========================================
    // LIQUID GLASS SWIPE LOGIC
    // ==========================================
    const swipeContainer = document.getElementById('swipeContainer');
    const swipeThumb = document.getElementById('swipeThumb');
    const swipeText = document.getElementById('swipeText');

    if (swipeContainer && swipeThumb) {
        let isDragging = false;
        let startX = 0;
        let maxDrag = 0;

        const updateMaxDrag = () => {
            maxDrag = swipeContainer.offsetWidth - swipeThumb.offsetWidth - 20; 
        };
        updateMaxDrag();

        const onStart = (e) => {
            isDragging = true;
            updateMaxDrag();
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            swipeThumb.style.transition = 'none';
        };

        const onMove = (e) => {
            if (!isDragging) return;
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            let deltaX = currentX - startX;

            if (deltaX < 0) deltaX = 0;
            if (deltaX > maxDrag) deltaX = maxDrag;

            swipeThumb.style.left = `${deltaX}px`;
            swipeText.style.opacity = 1 - (deltaX / maxDrag);

            if (deltaX >= maxDrag * 0.95) {
                isDragging = false;
                swipeThumb.innerHTML = '✔';
                window.open("https://69studiobysubash.online/", "_blank");
                setTimeout(() => {
                    swipeThumb.style.transition = 'left 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                    swipeThumb.style.left = '0px';
                    swipeText.style.opacity = '1';
                    swipeThumb.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
                }, 1000);
            }
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            swipeThumb.style.transition = 'left 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            swipeThumb.style.left = '0px';
            swipeText.style.opacity = '1';
        };

        swipeThumb.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);

        swipeThumb.addEventListener('touchstart', onStart, { passive: true });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);

        window.addEventListener('resize', updateMaxDrag);
    }

    // ==========================================
    // HERO CANVAS ANIMATION (Plexus Tech Network)
    // ==========================================
    const heroCanvasEl = document.getElementById('heroCanvas');
    if (heroCanvasEl) {
        const ctx = heroCanvasEl.getContext('2d');
        let width, height;
        let particles = [];

        const initCanvas = () => {
            width = heroCanvasEl.width = window.innerWidth;
            height = heroCanvasEl.height = window.innerHeight;
            particles = [];
            let particleCount = window.innerWidth > 768 ? 60 : 30;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(168, 85, 247, 0.9)'; // Brighter purple
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
                ctx.fill();
            }
        }

        const animateCanvas = () => {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(168, 85, 247, ${0.4 - dist/400})`; // Brighter laser
                        ctx.lineWidth = 1.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateCanvas);
        };

        initCanvas();
        animateCanvas();

        window.addEventListener('resize', () => {
            initCanvas();
        });
    }

    // ==========================================
    // MAGNETIC BUTTONS REFINED
    // ==========================================
    const magneticElements = document.querySelectorAll('.nav-link, .btn-outline, .btn-pill-white, .social-btn');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            if(el.classList.contains('nav-link')) {
                el.style.background = 'rgba(79, 70, 229, 0.05)';
            }
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = `translate(0px, 0px)`;
            if(el.classList.contains('nav-link') && !el.classList.contains('active')) {
                el.style.background = '';
            }
        });
    });

});
