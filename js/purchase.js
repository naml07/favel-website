/* FAVEL — Purchase Flow : Modal → WhatsApp */
'use strict';
const PurchaseFlow = (() => {
  let currentProduct = null;
  let selectedContactType = 'phone';
  function init() { renderModal(); bindCTAButtons(); bindModalEvents(); }
  function renderModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay'; modal.id = 'purchase-modal';
    modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'modal-title');
    modal.innerHTML = `<div class="modal" id="modal-content"><button class="modal__close" id="modal-close" aria-label="Fermer">✕</button><div class="modal__header"><p class="section-label">Commande</p><h2 class="modal__title" id="modal-title">Finaliser votre commande</h2><p class="modal__subtitle">Remplissez vos informations pour être redirigé vers WhatsApp</p></div><div class="modal__product-summary" id="modal-product-summary"><div class="modal__product-name" id="modal-product-name">—</div><div class="modal__product-price" id="modal-product-price">—</div></div><form class="modal__form" id="purchase-form" novalidate><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;"><div class="form-group"><label class="form-label" for="field-prenom">Prénom *</label><input class="form-input" type="text" id="field-prenom" name="prenom" placeholder="Kofi" required autocomplete="given-name"></div><div class="form-group"><label class="form-label" for="field-nom">Nom *</label><input class="form-input" type="text" id="field-nom" name="nom" placeholder="Asante" required autocomplete="family-name"></div></div><fieldset style="border:none;padding:0;margin-bottom:16px;"><legend class="form-label" style="margin-bottom:8px;">Comment vous contacter ? *</legend><div class="contact-choice"><button type="button" class="contact-choice-btn active" id="choice-phone" data-type="phone" aria-pressed="true">📱 Téléphone</button><button type="button" class="contact-choice-btn" id="choice-email" data-type="email" aria-pressed="false">✉️ Email</button></div></fieldset><div class="form-group" id="phone-group" style="margin-bottom:16px;"><label class="form-label" for="field-phone">Numéro de téléphone *</label><input class="form-input" type="tel" id="field-phone" name="phone" placeholder="+228 90 00 00 00" autocomplete="tel"></div><div class="form-group" id="email-group" style="margin-bottom:16px;display:none;"><label class="form-label" for="field-email">Adresse email *</label><input class="form-input" type="email" id="field-email" name="email" placeholder="kofi@exemple.com" autocomplete="email"></div><button type="submit" class="btn btn-whatsapp w-full btn-lg" style="margin-top:8px;">Commander via WhatsApp</button><p style="text-align:center;font-size:12px;color:var(--gray-600);margin-top:10px;">🔒 Vos informations restent confidentielles</p></form></div>`;
    document.body.appendChild(modal);
  }
  function bindCTAButtons() {
    document.querySelectorAll('[data-order]').forEach(btn => {
      btn.addEventListener('click', (e) => { e.preventDefault(); openModal({ name: btn.dataset.product || btn.dataset.order, price: btn.dataset.price || '', type: btn.dataset.type || 'Produit' }); });
    });
  }
  function openModal(product) {
    currentProduct = product;
    const overlay = document.getElementById('purchase-modal');
    const nameEl = document.getElementById('modal-product-name');
    const priceEl = document.getElementById('modal-product-price');
    if (nameEl) nameEl.textContent = product.name;
    if (priceEl) priceEl.textContent = product.price ? `${product.price} CFA` : '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('field-prenom')?.focus(), 300);
  }
  function closeModal() {
    document.getElementById('purchase-modal')?.classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('purchase-form')?.reset();
  }
  function bindModalEvents() {
    document.addEventListener('click', (e) => { if (e.target.id === 'modal-close' || e.target.id === 'purchase-modal') closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.getElementById('purchase-modal')?.classList.contains('open')) closeModal(); });
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.contact-choice-btn');
      if (!btn) return;
      const type = btn.dataset.type;
      selectedContactType = type;
      document.querySelectorAll('.contact-choice-btn').forEach(b => { b.classList.toggle('active', b.dataset.type === type); b.setAttribute('aria-pressed', b.dataset.type === type); });
      document.getElementById('phone-group').style.display = type === 'phone' ? '' : 'none';
      document.getElementById('email-group').style.display = type === 'email' ? '' : 'none';
      document.getElementById('field-phone').required = type === 'phone';
      document.getElementById('field-email').required = type === 'email';
    });
    document.addEventListener('submit', (e) => {
      if (e.target.id !== 'purchase-form') return;
      e.preventDefault();
      const prenom = document.getElementById('field-prenom')?.value.trim();
      const nom = document.getElementById('field-nom')?.value.trim();
      const phone = document.getElementById('field-phone')?.value.trim();
      const email = document.getElementById('field-email')?.value.trim();
      if (!prenom || !nom) { markError('field-prenom', !prenom); markError('field-nom', !nom); return; }
      if (selectedContactType === 'phone' && !phone) { markError('field-phone', true); return; }
      if (selectedContactType === 'email' && !email) { markError('field-email', true); return; }
      const contact = selectedContactType === 'phone' ? `Tél: ${phone}` : `Email: ${email}`;
      const productLine = currentProduct ? `Produit: *${currentProduct.name}*${currentProduct.price ? ` — ${currentProduct.price} CFA` : ''}` : '';
      const message = [`Bonjour FAVEL ! 👋`, ``, `Je souhaite commander :`, productLine, ``, `Mes informations :`, `Nom complet: *${prenom} ${nom}*`, contact, ``, `Merci de me confirmer la disponibilité. 🙏`].filter(Boolean).join('\n');
      const waNumber = window.FavelApp?.WHATSAPP_NUMBER || '22890000000';
      closeModal();
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      window.FavelApp?.showToast('Redirection vers WhatsApp...');
    });
  }
  function markError(fieldId, hasError) {
    const field = document.getElementById(fieldId);
    if (!field || !hasError) return;
    field.style.borderColor = '#EF4444'; field.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.2)'; field.focus();
    field.addEventListener('input', () => { field.style.borderColor = ''; field.style.boxShadow = ''; }, { once: true });
  }
  return { init, openModal };
})();
document.addEventListener('DOMContentLoaded', () => PurchaseFlow.init());
window.PurchaseFlow = PurchaseFlow;