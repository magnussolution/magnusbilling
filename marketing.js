const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

menuToggle?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

siteNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  });
});

const assessmentForm = document.querySelector('#assessment-form');
const formMessage = document.querySelector('#form-message');

assessmentForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  formMessage.textContent = 'Thanks — we’ll be in touch within one business day.';
  formMessage.classList.add('success');
  assessmentForm.querySelector('button').textContent = 'Assessment request received ✓';
  assessmentForm.querySelector('button').disabled = true;
});
