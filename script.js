/* ═══════════════════════════════════════════════════════
   STACKLY — app.js
   Particle system, page navigation, auth, charts, footer
   ═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────
   1. PARTICLE SYSTEM
   ───────────────────────────────────────────────────── */
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
let particles = [];
let W, H;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }

  reset() {
    this.x     = Math.random() * W;
    this.y     = Math.random() * H;
    this.r     = Math.random() * 1.5 + 0.3;
    this.vx    = (Math.random() - 0.5) * 0.3;
    this.vy    = (Math.random() - 0.5) * 0.3;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? '#4F46E5' : '#06B6D4';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle   = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// Spawn particles
for (let i = 0; i < 120; i++) {
  particles.push(new Particle());
}

function drawConnections() {
  const maxDist = 100;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = '#4F46E5';
        ctx.globalAlpha = (1 - dist / maxDist) * 0.15;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
animateParticles();


/* ─────────────────────────────────────────────────────
   2. PAGE NAVIGATION
   ───────────────────────────────────────────────────── */

/**
 * Show a page by its element ID, hiding all others.
 * @param {string} id - The ID of the page element to show.
 */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);

  // Rebuild charts when switching to dashboard pages
  if (id === 'page-student-dashboard') {
    setTimeout(buildActivityChart, 100);
  }
  if (id === 'page-instructor-dashboard') {
    setTimeout(buildRevenueChart, 100);
  }
}


/* ─────────────────────────────────────────────────────
   3. ROLE SELECTION (Sign-up page)
   ───────────────────────────────────────────────────── */
let selectedRole = 'student';

/**
 * Toggle the sign-up role between student and instructor.
 * @param {string} role - 'student' or 'instructor'
 */
function selectRole(role) {
  selectedRole = role;

  document.getElementById('role-student').classList.toggle('active',    role === 'student');
  document.getElementById('role-instructor').classList.toggle('active', role === 'instructor');

  const expertiseField = document.getElementById('expertise-field');
  expertiseField.style.display = role === 'instructor' ? 'block' : 'none';

  const signupBtn = document.getElementById('signup-btn');
  if (signupBtn) {
    signupBtn.querySelector('span').textContent =
      role === 'instructor' ? 'Join as Instructor' : 'Create my account';
  }
}


/* ─────────────────────────────────────────────────────
   4. AUTH HANDLERS
   ───────────────────────────────────────────────────── */

/**
 * Handle login form submission.
 * Routes to instructor or student dashboard based on email hint.
 * @param {MouseEvent} e
 */
function handleLogin(e) {
  addRipple(e);
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const destination = (email.includes('teach') || email.includes('instructor'))
    ? 'page-instructor-dashboard'
    : 'page-student-dashboard';

  setTimeout(() => showPage(destination), 400);
}

/**
 * Handle social OAuth button click — lands on student dashboard.
 * @param {string} provider - 'Google' | 'GitHub'
 */
function handleSocialLogin(provider) {
  console.log(`Social login via ${provider}`);
  setTimeout(() => showPage('page-student-dashboard'), 300);
}

/**
 * Handle sign-up form submission.
 * Routes to the correct dashboard based on selected role.
 * @param {MouseEvent} e
 */
function handleSignup(e) {
  addRipple(e);
  const destination = selectedRole === 'instructor'
    ? 'page-instructor-dashboard'
    : 'page-student-dashboard';

  setTimeout(() => showPage(destination), 400);
}


/* ─────────────────────────────────────────────────────
   5. RIPPLE EFFECT
   ───────────────────────────────────────────────────── */

/**
 * Create a ripple element on a button at the click position.
 * @param {MouseEvent} e
 */
function addRipple(e) {
  const btn    = e.currentTarget;
  const rect   = btn.getBoundingClientRect();
  const ripple = document.createElement('div');
  ripple.className  = 'ripple';
  ripple.style.left = (e.clientX - rect.left - 20) + 'px';
  ripple.style.top  = (e.clientY - rect.top  - 20) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}


/* ─────────────────────────────────────────────────────
   6. SIDEBAR TOGGLE (mobile)
   ───────────────────────────────────────────────────── */

/**
 * Toggle sidebar open/closed on mobile.
 * @param {string} id - ID of the sidebar element
 */
function toggleSidebar(id) {
  const sidebar = document.getElementById(id);
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('visible');
}

/**
 * Close all sidebars and hide the overlay.
 */
function closeSidebar() {
  document.querySelectorAll('.sidebar').forEach(s => s.classList.remove('open'));
  document.getElementById('sidebar-overlay').classList.remove('visible');
}


/* ─────────────────────────────────────────────────────
   7. BAR CHARTS
   ───────────────────────────────────────────────────── */

/**
 * Build the weekly activity bar chart for the student dashboard.
 */
function buildActivityChart() {
  const el = document.getElementById('activity-chart');
  if (!el) return;

  const data = [
    { day: 'Mon', val: 2.5 },
    { day: 'Tue', val: 1.8 },
    { day: 'Wed', val: 3.2 },
    { day: 'Thu', val: 2.0 },
    { day: 'Fri', val: 4.1 },
    { day: 'Sat', val: 1.5 },
    { day: 'Sun', val: 2.8 },
  ];

  const max = Math.max(...data.map(d => d.val));

  el.innerHTML = data.map(d => `
    <div class="bar-wrap">
      <div class="bar" style="height:${(d.val / max) * 100}%" title="${d.val}h"></div>
      <span class="bar-label">${d.day}</span>
    </div>
  `).join('');
}

/**
 * Build the monthly revenue bar chart for the instructor dashboard.
 */
function buildRevenueChart() {
  const el = document.getElementById('revenue-chart');
  if (!el) return;

  const data = [
    { m: 'Jan', val: 5200 },
    { m: 'Feb', val: 6100 },
    { m: 'Mar', val: 5800 },
    { m: 'Apr', val: 7200 },
    { m: 'May', val: 6900 },
    { m: 'Jun', val: 8240 },
  ];

  const max = Math.max(...data.map(d => d.val));

  el.innerHTML = data.map(d => `
    <div class="bar-wrap">
      <div class="bar"
           style="height:${(d.val / max) * 100}%;background:linear-gradient(0deg,#7C3AED,#06B6D4)"
           title="$${d.val.toLocaleString()}">
      </div>
      <span class="bar-label">${d.m}</span>
    </div>
  `).join('');
}


/* ─────────────────────────────────────────────────────
   8. FOOTER INJECTION
   Clones the shared footer template into auth pages.
   ───────────────────────────────────────────────────── */

/**
 * Inject the footer template into both auth pages.
 */
function injectFooters() {
  const template = document.getElementById('footer-template');
  if (!template) return;

  ['page-login', 'page-signup'].forEach(pageId => {
    const page = document.getElementById(pageId);
    if (page) {
      const clone = template.content.cloneNode(true);
      page.appendChild(clone);
    }
  });
}


/* ─────────────────────────────────────────────────────
   9. INIT
   ───────────────────────────────────────────────────── */
(function init() {
  buildActivityChart();
  buildRevenueChart();
  injectFooters();
})();