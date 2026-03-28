// ==========================================
// PREMIUM CINEMATIC INTRO LOGIC
// ==========================================
window.addEventListener('load', () => {
    const introScreen = document.getElementById('intro-screen');
    const introWord = document.getElementById('intro-word');
    const introLogo = document.getElementById('intro-logo');
    const introProgress = document.getElementById('intro-progress');
    const introIcon = document.getElementById('intro-icon');
    if (!introScreen) return;

    const words = ["Innovation", "Strategy", "Excellence", "Leadership"];
    const icons = [
        // Innovation (Bulb + Orbits)
        `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <path d="M50 78c14 0 22-10 22-22s-8-22-22-22-22 10-22 22 8 22 22 22zM42 78h16M44 84h12M47 90h6"/>
            <circle cx="50" cy="56" r="3" fill="currentColor"/>
            <ellipse class="orbit-1" cx="50" cy="56" rx="44" ry="14" transform="rotate(30 50 56)"/>
            <ellipse class="orbit-2" cx="50" cy="56" rx="44" ry="14" transform="rotate(-30 50 56)"/>
        </svg>`,
        // Strategy (Target + Arrow)
        `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <circle cx="50" cy="50" r="40" class="ring-1"/>
            <circle cx="50" cy="50" r="22" class="ring-2"/>
            <circle cx="50" cy="50" r="8" fill="currentColor"/>
            <g class="arrow-hit">
                <path d="M85 15L50 50" />
                <path d="M85 15l-2-12m2 12l-12-2" />
                <path d="M90 10l-2-12m2 12l-12-2" opacity="0.5"/>
            </g>
        </svg>`,
        // Excellence (Diamond)
        `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M25 20h50l20 25-45 45-45-45 20-25z" class="diamond-outline"/>
            <path d="M5 45h90" class="diamond-line"/>
            <path d="M25 20L45 45l5 45M75 20L55 45l-5 45M50 20v25" class="diamond-line"/>
        </svg>`,
        // Leadership (Nav Arrow)
        `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="nav-arrow-svg">
            <path d="M85 15L15 55l35 12 12 35z"/>
            <path d="M85 15L52 65" stroke-dasharray="4 4"/>
            <text x="85" y="10" font-size="10" font-weight="900" fill="currentColor" opacity="0.5">N</text>
        </svg>`
    ];
    let wordIndex = 0;
    let progress = 0;

    // Scramble Text Function
    function scrambleText(element, newText) {
        if(!element) return;
        let frame = 0;
        const target = newText;
        const length = target.length;
        
        const animate = () => {
            let complete = 0;
            let output = '';
            
            for (let i = 0; i < length; i++) {
                if (frame >= i * 4) { // Sequential reveal
                    output += target[i];
                    complete++;
                } else {
                    output += ' '; // Empty space instead of random chars
                }
            }
            
            element.textContent = output;
            if (complete === length) {
                element.classList.add('active');
            } else {
                requestAnimationFrame(animate);
                frame += 0.5;
            }
        }
        animate();
    }

    // Show first word immediately
    if(introWord) {
        scrambleText(introWord, words[0]);
        updateIcon(0);
        wordIndex++;
    }

    // Word change interval
    const wordInterval = setInterval(() => {
        if (wordIndex < words.length) {
            introWord.classList.add('exit');
            updateIcon(wordIndex);
            
            setTimeout(() => {
                introWord.classList.remove('exit');
                scrambleText(introWord, words[wordIndex]);
                wordIndex++;
            }, 800); 
        } else {
            clearInterval(wordInterval);
            finishIntro();
        }
    }, 2500); // 2.5s Word Interval (was 500ms)

    // Progress bar simulation
    const progressInterval = setInterval(() => {
        if (progress < 100) {
            progress += 1;
            if (introProgress) introProgress.style.width = `${progress}%`;
        } else {
            clearInterval(progressInterval);
        }
    }, 45);

    function updateIcon(index) {
        if(!introIcon) return;
        introIcon.classList.remove('active');
        
        setTimeout(() => {
            introIcon.innerHTML = icons[index];
            introIcon.classList.add('active');
        }, 600);
    }

    function finishIntro() {
        // Hide words and icons, show logo
        if(introWord) introWord.parentElement.style.display = 'none';
        if(introIcon) introIcon.style.display = 'none';
        if(introLogo) introLogo.classList.add('show');
        
        setTimeout(() => {
            if(introScreen) introScreen.classList.add('finished');
            
            // Zoom in effect for content reveal
            document.body.style.transition = 'transform 1.5s var(--ease)';
            document.body.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                if(introScreen) introScreen.classList.add('hide');
                document.body.style.overflow = 'auto'; // Re-enable scroll
                document.body.style.transform = 'scale(1)';
                
                setTimeout(() => {
                    document.body.style.transition = '';
                    document.body.style.transform = '';
                }, 1500);
            }, 1000);
        }, 1500);
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
