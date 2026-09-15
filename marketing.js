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
  const formData = new FormData(assessmentForm);
  const subject = encodeURIComponent(`Cloudflex assessment enquiry from ${formData.get('name')}`);
  const body = encodeURIComponent(`Name: ${formData.get('name')}\nEmail: ${formData.get('email')}\nCompany: ${formData.get('company')}\n\nWhat they would like to improve:\n${formData.get('message') || 'Not provided'}`);
  window.location.href = `mailto:support@cloudflex.ca?subject=${subject}&body=${body}`;
  formMessage.textContent = 'Your email app should open with the enquiry addressed to support@cloudflex.ca.';
  formMessage.classList.add('success');
});

const annaLauncher = document.querySelector('.anna-launcher');
const annaChat = document.querySelector('#anna-chat');
const annaClose = document.querySelector('.anna-close');
const annaForm = document.querySelector('.anna-form');
const annaInput = document.querySelector('#anna-input');
const annaMessages = document.querySelector('.anna-messages');

const annaReply = (text) => {
  const reply = text.toLowerCase().includes('service')
    ? 'We cover managed IT, cybersecurity, cloud, development, VoIP, infrastructure, backup, and advanced AI assistants.'
    : text.toLowerCase().includes('assessment')
      ? 'Great choice. Use the assessment form below or email support@cloudflex.ca and our team will take it from there.'
      : text.toLowerCase().includes('contact') || text.toLowerCase().includes('reach')
        ? 'You can email support@cloudflex.ca or call the office at 647-363-6846. We support teams across the US and Canada.'
        : 'I can help with services, pricing, or your free IT assessment. What would you like to explore?';
  const node = document.createElement('div');
  node.className = 'anna-message';
  node.textContent = reply;
  annaMessages.appendChild(node);
};

const sendToAnna = (text) => {
  if (!text.trim()) return;
  const user = document.createElement('div');
  user.className = 'anna-message user';
  user.textContent = text;
  annaMessages.appendChild(user);
  annaReply(text);
  annaInput.value = '';
};

annaLauncher?.addEventListener('click', () => {
  const open = annaChat.hasAttribute('hidden');
  annaChat.toggleAttribute('hidden', !open);
  annaLauncher.setAttribute('aria-expanded', String(open));
  if (open) annaInput.focus();
});
annaClose?.addEventListener('click', () => {
  annaChat.setAttribute('hidden', '');
  annaLauncher.setAttribute('aria-expanded', 'false');
});
document.querySelectorAll('[data-anna-prompt]').forEach((button) => button.addEventListener('click', () => sendToAnna(button.dataset.annaPrompt)));
annaForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  sendToAnna(annaInput.value);
});
