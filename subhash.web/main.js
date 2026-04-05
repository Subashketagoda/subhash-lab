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

    // Constellations removed for a clean space look.

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
        let globalAudioCtx = null;

        function initAudio() {
            try {
                if (!globalAudioCtx) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (!AudioContext) return false;
                    globalAudioCtx = new AudioContext();
                }
                if (globalAudioCtx.state === 'suspended') {
                    globalAudioCtx.resume();
                }
                // Play a silent buffer to unlock audio mechanism on iOS/mobile
                const buffer = globalAudioCtx.createBuffer(1, 1, 22050);
                const source = globalAudioCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(globalAudioCtx.destination);
                source.start(0);
                return true;
            } catch(e) { return false; }
        }

        // High-end Cinematic Sound Synthesis (Fixed for Mobile Audibility)
        function playCinematicEnterSound() {
            try {
                if (!globalAudioCtx) return;
                const ctx = globalAudioCtx;
                // Ensure context is running just in case
                if (ctx.state === 'suspended') ctx.resume();

                // Master Gain for extra loudness
                const masterGain = ctx.createGain();
                masterGain.gain.value = 1.8; // Boost master volume
                masterGain.connect(ctx.destination);

                const t = ctx.currentTime;

                // 1. Thick Sub/Mid Bass (Audible on mobile: 80Hz - 250Hz range)
                const bass = ctx.createOscillator();
                const bassGain = ctx.createGain();
                bass.type = 'sawtooth'; // Sawtooth has upper harmonics audible on phones
                bass.connect(bassGain);
                bassGain.connect(masterGain);
                
                bass.frequency.setValueAtTime(250, t);
                bass.frequency.exponentialRampToValueAtTime(50, t + 1.5);
                
                bassGain.gain.setValueAtTime(0, t);
                bassGain.gain.linearRampToValueAtTime(0.8, t + 0.1);
                bassGain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);

                // 2. Sci-Fi Warp Whoosh (White noise with sweeping lowpass)
                const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                for (let i = 0; i < noiseBuffer.length; i++) output[i] = Math.random() * 2 - 1;
                
                const whiteNoise = ctx.createBufferSource();
                whiteNoise.buffer = noiseBuffer;

                const noiseFilter = ctx.createBiquadFilter();
                noiseFilter.type = 'lowpass'; // Lowpass sounds fuller like a wind/whoosh
                noiseFilter.Q.value = 2.0;
                noiseFilter.frequency.setValueAtTime(200, t);
                noiseFilter.frequency.exponentialRampToValueAtTime(8000, t + 0.6);
                noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 1.8);

                const noiseGain = ctx.createGain();
                noiseGain.gain.setValueAtTime(0, t);
                noiseGain.gain.linearRampToValueAtTime(0.8, t + 0.4);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 2.0);

                whiteNoise.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(masterGain);

                // 3. High-Tech Synth Chime / Sparkle
                const synth = ctx.createOscillator();
                const synthGain = ctx.createGain();
                // Square wave gives that classic sci-fi/tech computer sound
                synth.type = 'square';
                synth.connect(synthGain);
                synthGain.connect(masterGain);
                
                synth.frequency.setValueAtTime(1200, t);
                synth.frequency.exponentialRampToValueAtTime(200, t + 0.8);
                
                synthGain.gain.setValueAtTime(0, t);
                synthGain.gain.linearRampToValueAtTime(0.25, t + 0.1);
                synthGain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);

                // Play all nodes
                bass.start(t); bass.stop(t + 1.6);
                whiteNoise.start(t); whiteNoise.stop(t + 2.0);
                synth.start(t); synth.stop(t + 1.1);
                
            } catch (e) { console.error("Audio API error:", e); }
        }

        const swipeBar = document.getElementById('introSwipeBar');
        const swipeThumb = document.getElementById('introSwipeThumb');
        const swipeText = document.getElementById('introSwipeText');
        if (!swipeBar || !swipeThumb) return;

        let isDragging = false, startX = 0;

        const getMaxDrag = () => swipeBar.offsetWidth - swipeThumb.offsetWidth - 8;

        const onStart = (e) => {
            initAudio(); // Unlock audio context on touchstart / mousedown
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

                // Play the sound!
                playCinematicEnterSound();

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
    // CONTACT FORM SUBMISSION
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
    // APPOINTMENT FORM SUBMISSION
    // ==========================================
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('apptName')?.value || 'Guest';
            const phone = document.getElementById('apptPhone')?.value || 'No Phone';
            const date = document.getElementById('apptDate')?.value || '';
            const time = document.getElementById('apptTime')?.value || '';
            const service = document.getElementById('apptService')?.value || 'General';
            
            if (typeof window.submitAppointmentToFirebase === 'function') {
                await window.submitAppointmentToFirebase(name, phone, date, time, service);
            }
            
            // Log local activity
            const log = JSON.parse(localStorage.getItem('so_activity_log') || '[]');
            const richMsg = `<strong>Service:</strong> ${service}<br><strong>Date/Time:</strong> ${date} at ${time}<br><strong>Contact:</strong> ${phone}`;
            log.unshift({
                type: 'info',
                msg: `New Appointment booked by <strong>${name}</strong><br><div style="margin-top:8px;padding:10px;background:rgba(0,0,0,0.2);border-radius:8px;border-left:3px solid var(--accent)">${richMsg}</div>`,
                ts: Date.now()
            });
            if (log.length > 50) log.length = 50;
            localStorage.setItem('so_activity_log', JSON.stringify(log));

            const btn = appointmentForm.querySelector('button[type="submit"] span');
            if(btn) btn.textContent = 'Appointment Confirmed! ✓';
            setTimeout(() => {
                if(btn) btn.textContent = 'Confirm Appointment';
                appointmentForm.reset();
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

    // ==========================================
    // ADMIN CUSTOM INJECTIONS (Banner & CSS)
    // ==========================================
    try {
        const css = localStorage.getItem('so_admin_css');
        if (css && css.trim()) {
            const style = document.createElement('style');
            style.id = 'admin-custom-css';
            style.innerHTML = css;
            document.head.appendChild(style);
        }

        const bannerData = localStorage.getItem('so_admin_banner');
        if (bannerData) {
            const banner = JSON.parse(bannerData);
            if (banner.enabled && banner.text) {
                const bannerEl = document.createElement('div');
                bannerEl.style.cssText = `
                    background: ${banner.color || '#4f46e5'};
                    color: white;
                    text-align: center;
                    padding: 10px 20px;
                    font-size: 14px;
                    font-weight: 500;
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    z-index: 99999;
                    cursor: ${banner.link ? 'pointer' : 'default'};
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                `;
                bannerEl.innerHTML = `<span>${banner.text}</span>`;
                if (banner.link) {
                    bannerEl.onclick = () => window.open(banner.link, '_blank');
                }
                document.body.appendChild(bannerEl);
                document.body.style.paddingTop = '40px'; // Prevent banner from overlapping content
            }
        }
    } catch(e) { console.error('Error applying admin settings', e); }
});

// ==========================================
// OLIVIA AI CHATBOT — ISOLATED ENGINE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("Olivia AI Web App initializing...");
    
    try {
        const aiBtn = document.getElementById('aiChatBtn');
        const aiWindow = document.getElementById('aiChatWindow');
        const aiClose = document.getElementById('aiChatClose');
        const aiBody = document.getElementById('aiChatBody');
        const aiInput = document.getElementById('aiChatInput');
        const aiSend = document.getElementById('aiChatSend');

        if (!aiBtn || !aiWindow) return;

        // --- Remote config sync ---
        const aiConfig = JSON.parse(localStorage.getItem('so_olivia_config') || '{"active":true,"scroll":300,"name":"Olivia","status":"AI Assistant"}');
        
        if (!aiConfig.active) {
            aiBtn.style.display = 'none';
            return;
        }

        // --- Update UI ---
        const headerName = aiWindow.querySelector('.ai-chat-title strong');
        const headerStatus = aiWindow.querySelector('.ai-chat-title span');
        if (headerName) headerName.textContent = aiConfig.name || "Olivia";
        if (headerStatus) headerStatus.textContent = aiConfig.status || "AI Assistant";

        if (aiConfig.welcome) {
            const firstMsg = aiBody.querySelector('.ai-msg-bot');
            if (firstMsg) firstMsg.textContent = aiConfig.welcome;
        }
        aiWindow.classList.remove('open');

        // --- Scroll logic ---
        const scrollLimit = aiConfig.scroll || 300;
        window.addEventListener('scroll', () => {
            if (window.scrollY > scrollLimit) {
                aiBtn.classList.add('show-ai-btn');
            } else {
                aiBtn.classList.remove('show-ai-btn');
                aiWindow.classList.remove('open');
            }
        });

        if (window.scrollY > scrollLimit) aiBtn.classList.add('show-ai-btn');

        // --- Interaction logic ---
        aiBtn.addEventListener('click', () => {
            aiWindow.classList.toggle('open');
            if (aiWindow.classList.contains('open')) aiInput.focus();
        });

        aiClose.addEventListener('click', () => aiWindow.classList.remove('open'));

        const addMessage = (text, isUser) => {
            const msgEl = document.createElement('div');
            msgEl.className = `ai-msg ${isUser ? 'ai-msg-user' : 'ai-msg-bot'}`;
            msgEl.textContent = text;
            aiBody.appendChild(msgEl);
            aiBody.scrollTop = aiBody.scrollHeight;
        };

        const showTyping = () => {
            const typingEl = document.createElement('div');
            typingEl.className = 'ai-typing';
            typingEl.innerHTML = '<span></span><span></span><span></span>';
            aiBody.appendChild(typingEl);
            aiBody.scrollTop = aiBody.scrollHeight;
            return typingEl;
        };

        // --- Dummy AI Response Engine ---
        const aiKnowledge = {
            greetings: {
                kw: ["hi", "hello", "hey", "hola", "greetings", "kohomada", "halow", "morning"],
                ans: [
                    "Hi there! 👋 I'm Olivia. How can I assist you?",
                    "Hello! ✨ Olivia here. How can I help you?",
                    "Hey! Hope you're having a productive day. How can I help?"
                ]
            },
            contact: {
                kw: ["contact", "email", "phone", "call", "reach", "message", "hire"],
                ans: [
                    "You can reach Subhash via the contact form or call +94 76 121 0164.",
                    "Looking to collaborate? 🤝 Use the form below or drop an email to hello@subhash.online.",
                    "The fastest way is the contact form on this page! You can also WhatsApp +94 76 121 0164."
                ]
            },
            services: {
                kw: ["service", "what do you do", "skills", "offer", "tech", "development", "web", "design", "app"],
                ans: [
                    "Subhash specializes in Web Development, Brand Strategy, and Digital Growth. 🚀",
                    "From UI/UX design to full-stack engineering, we build premium digital products.",
                    "We offer end-to-end digital transformation. Check the Services section!"
                ]
            },
            pricing: {
                kw: ["price", "cost", "how much", "rate", "budget", "quote"],
                ans: [
                    "Project pricing depends on your specific needs! Send a message via the form below.",
                    "We offer customized solutions for any budget! Let's discuss your project details.",
                    "Every project is unique! Send us a brief description and we'll send a proposal."
                ]
            },
            about: {
                kw: ["who are you", "who is subhash", "about", "69 studio", "kawuda", "subhash kauruda"],
                ans: [
                    "Subhash is a visionary entrepreneur from Colombo. He owns 69 Studio and Special Beats.",
                    "I'm Olivia, Subhash's personal AI assistant! Subhash is an expert in digital branding.",
                    "Subhash is a creative digital professional dedicated to building premium brands."
                ]
            }
        };

        const getAiResponse = (text) => {
            const lowerText = text.toLowerCase();
            const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

            for (const category in aiKnowledge) {
                if (aiKnowledge[category].kw.some(w => lowerText.includes(w))) {
                    return pick(aiKnowledge[category].ans);
                }
            }
            
            return "I'm not exactly sure about that, but Subhash would definitely know! Why not drop him a message via the form? 🚀";
        };

        const handleSend = () => {
            const text = aiInput.value.trim();
            if(!text) return;
            
            addMessage(text, true);
            aiInput.value = '';

            // --- SAVE TO ADMIN DATABASE (Activity Feed) ---
            try {
                const log = JSON.parse(localStorage.getItem('so_activity_log') || '[]');
                log.unshift({
                    type: 'info',
                    msg: `AI Chat: Guest asked: <strong>"${text}"</strong>`,
                    ts: Date.now()
                });
                if (log.length > 50) log.length = 50;
                localStorage.setItem('so_activity_log', JSON.stringify(log));
            } catch(e) {}
            
            const typingInd = showTyping();
            
            setTimeout(() => {
                if (typingInd && typingInd.parentNode) typingInd.remove();
                addMessage(getAiResponse(text), false);
            }, 1200);
        };

        aiSend.addEventListener('click', handleSend);
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });

    } catch (err) {
        console.error("Olivia AI Error:", err);
    }
});
