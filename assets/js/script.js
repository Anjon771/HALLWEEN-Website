/**
 * Halloween Party - Interactive Script
 * Features: Mobile Nav, Spooky Web Audio, Countdown Timer, Attraction Filtering,
 * Ticket Calculator & Booking Engine, FAQ Accordion, Particle Ambience, Newsletter.
 */

'use strict';

// 1. PRELOADER
const preloader = document.querySelector('[data-preloader]');
function dismissPreloader() {
  if (preloader) {
    preloader.classList.add('loaded');
  }
}
if (document.readyState === 'complete') {
  dismissPreloader();
} else {
  window.addEventListener('load', dismissPreloader);
  setTimeout(dismissPreloader, 1500); // safety fallback
}

// 2. MOBILE NAVIGATION & BACKDROP
const navToggler = document.querySelector('[data-nav-toggler]');
const navbar = document.querySelector('[data-navbar]');
const navBackdrop = document.querySelector('[data-nav-backdrop]');
const navLinks = document.querySelectorAll('.navbar-link');

function toggleNav() {
  if (!navbar || !navToggler) return;
  navbar.classList.toggle('active');
  navToggler.classList.toggle('active');
  if (navBackdrop) navBackdrop.classList.toggle('active');
  document.body.style.overflow = navbar.classList.contains('active') ? 'hidden' : '';
}

function closeNav() {
  if (!navbar || !navToggler) return;
  navbar.classList.remove('active');
  navToggler.classList.remove('active');
  if (navBackdrop) navBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

if (navToggler) navToggler.addEventListener('click', toggleNav);
if (navBackdrop) navBackdrop.addEventListener('click', closeNav);
navLinks.forEach(link => link.addEventListener('click', closeNav));

// 3. HEADER SCROLL & BACK TO TOP
const header = document.querySelector('[data-header]');
const backToTopBtn = document.querySelector('[data-back-to-top]');

window.addEventListener('scroll', function () {
  const scrollY = window.scrollY;
  if (header) {
    if (scrollY > 50) {
      header.classList.add('active');
    } else {
      header.classList.remove('active');
    }
  }

  if (backToTopBtn) {
    if (scrollY > 400) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  }
});

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// 4. COUNTDOWN TIMER
const daysEl = document.getElementById('cd-days');
const hoursEl = document.getElementById('cd-hours');
const minsEl = document.getElementById('cd-mins');
const secsEl = document.getElementById('cd-secs');

function initCountdown() {
  const currentYear = new Date().getFullYear();
  let targetTime = new Date(`October 31, ${currentYear} 20:00:00`).getTime();

  // If already past this year's Halloween, count down to next year
  if (Date.now() > targetTime) {
    targetTime = new Date(`October 31, ${currentYear + 1} 20:00:00`).getTime();
  }

  function updateTimer() {
    const now = Date.now();
    const diff = targetTime - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(m).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(s).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}
initCountdown();

// 5. SPOOKY AMBIENT AUDIO (Pure Web Audio API synth)
let audioCtx = null;
let isAudioPlaying = false;
let droneOsc1 = null;
let droneOsc2 = null;
let droneGain = null;
let lfo = null;
let chimeInterval = null;

const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const soundText = document.getElementById('soundText');

function initSpookyAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();

    // Master gain
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    // Lowpass filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, audioCtx.currentTime);
    filter.Q.setValueAtTime(4, audioCtx.currentTime);
    filter.connect(masterGain);

    // LFO to slowly sweep filter frequency (wind/breathing effect)
    lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.setValueAtTime(0.2, audioCtx.currentTime);
    lfoGain.gain.setValueAtTime(140, audioCtx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // Drone Oscillator 1 (Low C# / 69.3 Hz)
    droneOsc1 = audioCtx.createOscillator();
    droneOsc1.type = 'sawtooth';
    droneOsc1.frequency.setValueAtTime(69.3, audioCtx.currentTime);

    // Drone Oscillator 2 (Slightly detuned for eerie beating / 70.1 Hz)
    droneOsc2 = audioCtx.createOscillator();
    droneOsc2.type = 'triangle';
    droneOsc2.frequency.setValueAtTime(70.1, audioCtx.currentTime);

    droneGain = audioCtx.createGain();
    droneGain.gain.setValueAtTime(0.5, audioCtx.currentTime);

    droneOsc1.connect(droneGain);
    droneOsc2.connect(droneGain);
    droneGain.connect(filter);

    droneOsc1.start();
    droneOsc2.start();

    // Occasional eerie bell chime
    function playChime() {
      if (!audioCtx || audioCtx.state !== 'running' || !isAudioPlaying) return;
      const chimeOsc = audioCtx.createOscillator();
      const chimeGain = audioCtx.createGain();
      const notes = [440, 523.25, 659.25, 783.99, 880];
      const note = notes[Math.floor(Math.random() * notes.length)];

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(note, audioCtx.currentTime);

      chimeGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.0);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(masterGain);

      chimeOsc.start();
      chimeOsc.stop(audioCtx.currentTime + 3.2);
    }

    chimeInterval = setInterval(playChime, 4500);
    isAudioPlaying = true;
    updateSoundUI(true);
  } catch (err) {
    console.warn('Audio init error:', err);
  }
}

function stopSpookyAudio() {
  if (audioCtx) {
    audioCtx.suspend();
    isAudioPlaying = false;
    updateSoundUI(false);
  }
}

function updateSoundUI(playing) {
  if (!soundToggleBtn) return;
  if (playing) {
    soundToggleBtn.classList.add('playing');
    if (soundIcon) soundIcon.setAttribute('name', 'volume-high-outline');
    if (soundText) soundText.textContent = 'Sound: ON';
  } else {
    soundToggleBtn.classList.remove('playing');
    if (soundIcon) soundIcon.setAttribute('name', 'volume-mute-outline');
    if (soundText) soundText.textContent = 'Sound: OFF';
  }
}

if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', () => {
    if (!audioCtx) {
      initSpookyAudio();
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume();
      isAudioPlaying = true;
      updateSoundUI(true);
    } else {
      stopSpookyAudio();
    }
  });
}

// 6. ATTRACTION CATEGORY FILTER
const filterBtns = document.querySelectorAll('.filter-btn');
const attractionCards = document.querySelectorAll('.attraction-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filterVal = btn.getAttribute('data-filter');
    attractionCards.forEach(card => {
      const category = card.getAttribute('data-category');
      if (filterVal === 'all' || category === filterVal) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// 7. INTERACTIVE BOOKING ENGINE & CALCULATOR
const state = {
  selectedTier: 'vip',
  tierName: 'VIP Witching Pass',
  tierPrice: 65,
  date: 'Oct 31',
  timeSlot: '10:00 PM',
  quantity: 2,
  addons: {
    fastpass: false,
    mug: false,
    parking: false
  },
  addonPrices: {
    fastpass: 15,
    mug: 10,
    parking: 12
  }
};

const tierCards = document.querySelectorAll('.tier-choice-card');
const datePills = document.querySelectorAll('.date-pill');
const slotChips = document.querySelectorAll('.slot-chip');
const quantityEl = document.getElementById('ticketQuantity');
const btnMinus = document.getElementById('btnMinus');
const btnPlus = document.getElementById('btnPlus');
const addonInputs = document.querySelectorAll('.addon-input');

// Summary elements
const sumTierName = document.getElementById('sumTierName');
const sumDateTime = document.getElementById('sumDateTime');
const sumTickets = document.getElementById('sumTickets');
const sumSubtotal = document.getElementById('sumSubtotal');
const sumAddons = document.getElementById('sumAddons');
const sumTotal = document.getElementById('sumTotal');

function updateBookingCalculation() {
  const baseSubtotal = state.tierPrice * state.quantity;
  let addonsSubtotal = 0;

  if (state.addons.fastpass) addonsSubtotal += state.addonPrices.fastpass * state.quantity;
  if (state.addons.mug) addonsSubtotal += state.addonPrices.mug * state.quantity;
  if (state.addons.parking) addonsSubtotal += state.addonPrices.parking; // flat parking

  const grandTotal = baseSubtotal + addonsSubtotal;

  if (sumTierName) sumTierName.textContent = state.tierName;
  if (sumDateTime) sumDateTime.textContent = `${state.date} @ ${state.timeSlot}`;
  if (sumTickets) sumTickets.textContent = `${state.quantity}x Tickets`;
  if (sumSubtotal) sumSubtotal.textContent = `$${baseSubtotal}`;
  if (sumAddons) sumAddons.textContent = `$${addonsSubtotal}`;
  if (sumTotal) sumTotal.textContent = `$${grandTotal}`;
}

// Select Tier via Booking Form
function setTier(tierKey) {
  state.selectedTier = tierKey;
  if (tierKey === 'general') {
    state.tierName = 'General Zombie Pass';
    state.tierPrice = 35;
  } else if (tierKey === 'vip') {
    state.tierName = 'VIP Witching Pass';
    state.tierPrice = 65;
  } else if (tierKey === 'coven') {
    state.tierName = 'Coven Group Pass';
    state.tierPrice = 120;
  }

  tierCards.forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-tier') === tierKey);
  });
  updateBookingCalculation();
}

tierCards.forEach(c => {
  c.addEventListener('click', () => {
    const tier = c.getAttribute('data-tier');
    setTier(tier);
  });
});

// Connect Pricing Section buttons to Booking Form
const pricingBookBtns = document.querySelectorAll('[data-pricing-tier]');
pricingBookBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const tier = btn.getAttribute('data-pricing-tier');
    setTier(tier);
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Date Pill selection
datePills.forEach(p => {
  p.addEventListener('click', () => {
    datePills.forEach(dp => dp.classList.remove('active'));
    p.classList.add('active');
    state.date = p.getAttribute('data-date');
    updateBookingCalculation();
  });
});

// Time Slot selection
slotChips.forEach(sc => {
  sc.addEventListener('click', () => {
    slotChips.forEach(s => s.classList.remove('active'));
    sc.classList.add('active');
    state.timeSlot = sc.getAttribute('data-slot');
    updateBookingCalculation();
  });
});

// Quantity Steppers
if (btnMinus) {
  btnMinus.addEventListener('click', () => {
    if (state.quantity > 1) {
      state.quantity--;
      if (quantityEl) quantityEl.textContent = state.quantity;
      updateBookingCalculation();
    }
  });
}

if (btnPlus) {
  btnPlus.addEventListener('click', () => {
    if (state.quantity < 10) {
      state.quantity++;
      if (quantityEl) quantityEl.textContent = state.quantity;
      updateBookingCalculation();
    }
  });
}

// Add-ons checkboxes
addonInputs.forEach(input => {
  input.addEventListener('change', () => {
    const addonKey = input.getAttribute('data-addon');
    state.addons[addonKey] = input.checked;
    updateBookingCalculation();
  });
});

// Initial calc run
updateBookingCalculation();

// 8. BOOKING SUBMISSION & TICKET MODAL
const bookingForm = document.getElementById('bookingForm');
const modalBackdrop = document.getElementById('ticketModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalDoneBtn = document.getElementById('modalDoneBtn');
const printTicketBtn = document.getElementById('printTicketBtn');

const tktCode = document.getElementById('tktCode');
const tktTier = document.getElementById('tktTier');
const tktGuest = document.getElementById('tktGuest');
const tktDateTime = document.getElementById('tktDateTime');
const tktQty = document.getElementById('tktQty');
const tktTotal = document.getElementById('tktTotal');

if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('guestName');
    const emailInput = document.getElementById('guestEmail');

    const guestName = nameInput ? nameInput.value.trim() : 'Honored Guest';
    const randomCode = 'HW-' + Math.floor(1000 + Math.random() * 9000);

    // Populate ticket
    if (tktCode) tktCode.textContent = randomCode;
    if (tktTier) tktTier.textContent = state.tierName;
    if (tktGuest) tktGuest.textContent = guestName;
    if (tktDateTime) tktDateTime.textContent = `${state.date} @ ${state.timeSlot}`;
    if (tktQty) tktQty.textContent = `${state.quantity} Person(s)`;
    if (tktTotal && sumTotal) tktTotal.textContent = sumTotal.textContent;

    // Show modal
    if (modalBackdrop) modalBackdrop.classList.add('open');
  });
}

function closeModal() {
  if (modalBackdrop) modalBackdrop.classList.remove('open');
}

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeModal);
if (modalBackdrop) {
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
}

if (printTicketBtn) {
  printTicketBtn.addEventListener('click', () => {
    window.print();
  });
}

// 9. FAQ ACCORDION
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  const questionBtn = item.querySelector('.faq-question');
  if (questionBtn) {
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(other => other.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  }
});

// 10. NEWSLETTER SUMMONING
const newsletterForm = document.getElementById('newsletterForm');
const newsletterFeedback = document.getElementById('newsletterFeedback');

if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    if (emailInput && emailInput.value) {
      if (newsletterFeedback) {
        newsletterFeedback.classList.add('show');
        newsletterFeedback.textContent = `🦇 You are summoned! A VIP maze map was sent to ${emailInput.value}`;
      }
      emailInput.value = '';
    }
  });
}

// 11. SUBTLE FLOATING SPOOKY PARTICLES CANVAS (EMBERS / GHOST FIREFLIES)
function initParticleCanvas() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.parentElement.offsetWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight);

  window.addEventListener('resize', () => {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  });

  const particles = [];
  const particleCount = 28;
  const colors = ['rgba(251, 115, 0, 0.7)', 'rgba(122, 203, 201, 0.6)', 'rgba(255, 178, 77, 0.5)'];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedY: -(Math.random() * 0.8 + 0.3),
      speedX: (Math.random() - 0.5) * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.pulse += 0.03;

      if (p.y < 0) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      const alphaPulse = Math.sin(p.pulse) * 0.3 + 0.7;
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alphaPulse, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(render);
  }

  render();
}
initParticleCanvas();
