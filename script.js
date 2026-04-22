/* ============================================================
   META TITLE & DESCRIPTION CHARACTER COUNTER — script.js
   ============================================================ */

'use strict';

/* ─── Constants ──────────────────────────────────────────── */
const TITLE_SAFE  = 50;
const TITLE_WARN  = 60;
const TITLE_MAX   = 60;

const DESC_SAFE   = 140;
const DESC_WARN   = 160;
const DESC_MAX    = 160;

/* Average pixel-per-character estimate for Google title font (~20px) */
const PX_PER_CHAR_AVG = 6.5;  /* rough average for mixed-case Latin */

/* ─── DOM References ─────────────────────────────────────── */
const titleInput     = document.getElementById('title-input');
const titleCount     = document.getElementById('title-count');
const titleProgress  = document.getElementById('title-progress');
const titleStatus    = document.getElementById('title-status');
const titlePixels    = document.getElementById('title-pixels');

const descInput      = document.getElementById('desc-input');
const descCount      = document.getElementById('desc-count');
const descProgress   = document.getElementById('desc-progress');
const descStatus     = document.getElementById('desc-status');

const serpTitle      = document.getElementById('serp-title');
const serpDesc       = document.getElementById('serp-desc');

const copyTitleBtn   = document.getElementById('copy-title-btn');
const copyDescBtn    = document.getElementById('copy-desc-btn');
const resetBtn       = document.getElementById('reset-btn');

const themeToggle    = document.getElementById('theme-toggle');
const themeIcon      = document.getElementById('theme-icon');

const tocToggle      = document.getElementById('toc-toggle');
const tocBody        = document.getElementById('toc-body');
const tocChevron     = document.getElementById('toc-chevron');

const toast          = document.getElementById('toast');

const statTitleChars = document.getElementById('stat-title-chars');
const statDescChars  = document.getElementById('stat-desc-chars');
const statTitlePx    = document.getElementById('stat-title-px');

/* ─── Theme ──────────────────────────────────────────────── */
const savedTheme = localStorage.getItem('seo-theme') || 'dark';
applyTheme(savedTheme);

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('seo-theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ─── Table of Contents ──────────────────────────────────── */
let tocOpen = false;
tocToggle.addEventListener('click', () => {
  tocOpen = !tocOpen;
  tocBody.classList.toggle('open', tocOpen);
  tocChevron.classList.toggle('open', tocOpen);
});

/* ─── Helpers ────────────────────────────────────────────── */
function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

function getStatus(len, safe, warn) {
  if (len <= safe) return 'safe';
  if (len <= warn) return 'warn';
  return 'over';
}

function getStatusLabel(status, len, max) {
  if (status === 'safe')  return `✅ Good length (${len}/${max})`;
  if (status === 'warn')  return `⚠️ Approaching limit (${len}/${max})`;
  return `🔴 Over recommended limit (${len}/${max})`;
}

function applyStatus(element, status) {
  element.classList.remove('safe', 'warn', 'over');
  element.classList.add(status);
}

function estimatePx(text) {
  /* Very rough pixel estimate — narrow chars counted narrower */
  let px = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if ('ijl!|.,;: '.includes(ch))      px += 4;
    else if ('mwMW'.includes(ch))        px += 9;
    else if (ch >= 'A' && ch <= 'Z')     px += 7;
    else if (ch >= 'a' && ch <= 'z')     px += 6;
    else if (ch >= '0' && ch <= '9')     px += 6.5;
    else                                  px += 6.5;
  }
  return Math.round(px);
}

/* ─── Title Counter ──────────────────────────────────────── */
function updateTitle() {
  const val = titleInput.value;
  const len = val.length;
  const status = getStatus(len, TITLE_SAFE, TITLE_WARN);
  const pct = clamp((len / TITLE_WARN) * 100, 0, 100);
  const px  = estimatePx(val);

  /* Badge */
  titleCount.innerHTML = `<span class="count-num">${len}</span>&nbsp;/ ${TITLE_WARN} chars`;
  applyStatus(titleCount, `status-${status}`);

  /* Progress */
  titleProgress.style.width = pct + '%';
  applyStatus(titleProgress, status);

  /* Status text */
  titleStatus.textContent = getStatusLabel(status, len, TITLE_WARN);
  applyStatus(titleStatus, status);

  /* Pixel estimate */
  const pxClass = px <= 570 ? 'safe' : px <= 600 ? 'warn' : 'over';
  const pxColors = { safe: 'var(--green)', warn: 'var(--orange)', over: 'var(--red)' };
  titlePixels.innerHTML = `Estimated Google pixel width: <span style="color:${pxColors[pxClass]}">${px}px</span> <em style="color:var(--text-muted)">(limit ~570px)</em>`;

  /* Stats bar */
  statTitleChars.textContent = len;
  statTitlePx.textContent    = px + 'px';

  /* SERP */
  updateSerp();
}

/* ─── Description Counter ────────────────────────────────── */
function updateDesc() {
  const val = descInput.value;
  const len = val.length;
  const status = getStatus(len, DESC_SAFE, DESC_WARN);
  const pct = clamp((len / DESC_WARN) * 100, 0, 100);

  /* Badge */
  descCount.innerHTML = `<span class="count-num">${len}</span>&nbsp;/ ${DESC_WARN} chars`;
  applyStatus(descCount, `status-${status}`);

  /* Progress */
  descProgress.style.width = pct + '%';
  applyStatus(descProgress, status);

  /* Status text */
  descStatus.textContent = getStatusLabel(status, len, DESC_WARN);
  applyStatus(descStatus, status);

  /* Stats bar */
  statDescChars.textContent = len;

  /* SERP */
  updateSerp();
}

/* ─── SERP Preview ───────────────────────────────────────── */
function updateSerp() {
  const title = titleInput.value.trim();
  const desc  = descInput.value.trim();

  if (title) {
    serpTitle.textContent = title;
    serpTitle.classList.remove('serp-placeholder');
  } else {
    serpTitle.textContent = 'Your page title will appear here…';
    serpTitle.classList.add('serp-placeholder');
  }

  if (desc) {
    serpDesc.textContent = desc;
    serpDesc.classList.remove('serp-placeholder');
  } else {
    serpDesc.textContent = 'Your meta description will appear here. Write a compelling summary that encourages users to click your link.';
    serpDesc.classList.add('serp-placeholder');
  }
}

/* ─── Copy Buttons ───────────────────────────────────────── */
async function copyText(text, btn, label) {
  if (!text) { showToast('Nothing to copy!'); return; }
  try {
    await navigator.clipboard.writeText(text);
    btn.classList.add('copied');
    btn.innerHTML = `✅ Copied!`;
    showToast(`${label} copied to clipboard`);
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = label === 'Title'
        ? `📋 Copy Title`
        : `📋 Copy Description`;
    }, 2000);
  } catch {
    /* Fallback for non-secure contexts */
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(`${label} copied!`);
  }
}

copyTitleBtn.addEventListener('click', () =>
  copyText(titleInput.value, copyTitleBtn, 'Title'));

copyDescBtn.addEventListener('click', () =>
  copyText(descInput.value, copyDescBtn, 'Description'));

/* ─── Reset ──────────────────────────────────────────────── */
resetBtn.addEventListener('click', () => {
  titleInput.value = '';
  descInput.value  = '';
  updateTitle();
  updateDesc();
  showToast('Fields cleared ↺');
});

/* ─── Toast ──────────────────────────────────────────────── */
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ─── Live Listeners ─────────────────────────────────────── */
titleInput.addEventListener('input', updateTitle);
descInput.addEventListener('input',  updateDesc);

/* ─── Keyboard Shortcuts ─────────────────────────────────── */
document.addEventListener('keydown', e => {
  /* Ctrl/Cmd + Shift + R → Reset */
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'r') {
    e.preventDefault();
    resetBtn.click();
  }
});

/* ─── Smooth Scroll for TOC Links ────────────────────────── */
document.querySelectorAll('.toc-list a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      /* Close TOC on mobile after click */
      if (window.innerWidth < 640 && tocOpen) tocToggle.click();
    }
  });
});

/* ─── Initial Render ─────────────────────────────────────── */
updateTitle();
updateDesc();
