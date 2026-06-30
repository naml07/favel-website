/* FAVEL — Main JavaScript */
'use strict';
const WHATSAPP_NUMBER = '22890000000';
document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initNavigation();
  initCustomCursor();
  initScrollEffects();
  initRippleButtons();
  initWhatsAppFloat();
  initScrollTop();
  initAccordions();
  setActiveNavLink();
});
function initPageLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;
  window.addEventListener('load', () => { setTimeout(() => { loader.classList.add('loaded'); }, 600); });
  setTimeout(() => { if (loader) loader.classList.add('loaded'); }, 2500);
}
function initNavigation() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile');
  const mobileLinks = document.querySelectorAll('.nav__mobile-link');
  if (!nav) return;
  window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 50); }, { passive: true });
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('open');
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = isOpen ? '' : 'hidden';
      hamburger.setAttribute('aria-expanded', !isOpen);
    });
    mobileLinks.forEach(link => link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) {
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}
function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) link.classList.add('active');
  });
}
function initCustomCursor() {
  if (!window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) return;
  const cursor = document.createElement('div');
  const follower = document.createElement('div');
  cursor.className = 'cursor'; follower.className = 'cursor-follower';
  document.body.appendChild(cursor); document.body.appendChild(follower);
  let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;
  document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px'; });
  function animateFollower() { followerX += (mouseX - followerX) * 0.12; followerY += (mouseY - followerY) * 0.12; follower.style.left = followerX + 'px'; follower.style.top = followerY + 'px'; requestAnimationFrame(animateFollower); }
  animateFollower();
}
function initScrollEffects() {
  const reveals = document.querySelectorAll('[data-reveal]');
  const staggerGroups = document.querySelectorAll('[data-stagger]');
  if (!('IntersectionObserver' in window)) { reveals.forEach(el => el.classList.add('revealed')); staggerGroups.forEach(el => el.classList.add('revealed')); return; }
  const obs = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { setTimeout(() => entry.target.classList.add('revealed'), parseInt(entry.target.dataset.delay || 0)); obs.unobserve(entry.target); } }); }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });
  reveals.forEach(el => obs.observe(el)); staggerGroups.forEach(el => obs.observe(el));
  initCounters();
}
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { animateCounter(entry.target); obs.unobserve(entry.target); } }); }, { threshold: 0.5 });
  counters.forEach(el => obs.observe(el));
}
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  function update(now) { const p = Math.min((now - start) / 2000, 1); el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target).toLocaleString('fr-FR') + suffix; if (p < 1) requestAnimationFrame(update); }
  requestAnimationFrame(update);
}
function initRippleButtons() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
}
function initWhatsAppFloat() {
  const float = document.querySelector('.whatsapp-float');
  if (!float) return;
  float.setAttribute('href', `https://wa.me/${WHATSAPP_NUMBER}`);
}
function initScrollTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.accordion-item.open').forEach(i => { if (i !== item) i.classList.remove('open'); });
      item.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', !isOpen);
    });
  });
}
function showToast(message, duration = 3000) {
  let toast = document.querySelector('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite'); document.body.appendChild(toast); }
  toast.innerHTML = `✓ ${message}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});
window.FavelApp = { showToast, WHATSAPP_NUMBER };