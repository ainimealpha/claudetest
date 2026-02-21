// ============================================================
//  GALLERY CODEX — Shared Script
//  Handles: stars, modal, toast, search, card rendering,
//           data loading, pagination, likes
// ============================================================

/* ── Stars ──────────────────────────────────────────────────── */
function spawnStars(count = 80) {
  const container = document.querySelector(".stars");
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "star";
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      --dur:${Math.random()*3+2}s;
      animation-delay:${Math.random()*4}s;
    `;
    container.appendChild(s);
  }
}

/* ── Toast ──────────────────────────────────────────────────── */
function showToast(msg) {
  const t = document.querySelector(".toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

/* ── Liked items (localStorage) ─────────────────────────────── */
function getLikes() {
  try { return JSON.parse(localStorage.getItem("codex_likes") || "[]"); } catch { return []; }
}
function toggleLike(id) {
  const likes = getLikes();
  const i = likes.indexOf(id);
  if (i > -1) { likes.splice(i, 1); showToast("✦ Removed from favorites"); }
  else { likes.push(id); showToast("♥ Added to favorites!"); }
  localStorage.setItem("codex_likes", JSON.stringify(likes));
  return i === -1; // true = now liked
}
function isLiked(id) { return getLikes().includes(id); }

/* ── Card Builder ───────────────────────────────────────────── */
function buildCard(item, index) {
  const liked = isLiked(item.id);
  const card = document.createElement("div");
  card.className = "card";
  card.style.animationDelay = `${index * 0.04}s`;
  card.dataset.id = item.id;
  card.innerHTML = `
    ${item.featured === "true" ? '<span class="card-badge">✦ Featured</span>' : ""}
    <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='https://picsum.photos/seed/${item.id}/400/560'">
    <div class="card-overlay">
      <div class="card-title">${item.title}</div>
      <div class="card-cat">${item.category}</div>
    </div>
  `;
  card.addEventListener("click", () => openModal(item));
  return card;
}

/* ── Render Grid ────────────────────────────────────────────── */
function renderGrid(items, gridEl, emptyEl) {
  gridEl.innerHTML = "";
  if (!items || items.length === 0) {
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }
  if (emptyEl) emptyEl.style.display = "none";
  items.forEach((item, i) => gridEl.appendChild(buildCard(item, i)));
}

/* ── Modal ──────────────────────────────────────────────────── */
let _modalOpen = false;
function openModal(item) {
  const bg = document.getElementById("modalBg");
  if (!bg) return;
  const liked = isLiked(item.id);
  bg.querySelector(".modal-img").src = item.image;
  bg.querySelector(".modal-img").onerror = function() {
    this.src = `https://picsum.photos/seed/${item.id}/800/600`;
  };
  bg.querySelector(".modal-title").textContent = item.title;
  bg.querySelector(".modal-artist").textContent = `by ${item.artist || "Unknown Artist"}`;
  bg.querySelector(".modal-cat").textContent = item.category;
  bg.querySelector(".modal-desc").textContent = item.description || "No description available.";
  const tagsEl = bg.querySelector(".modal-tags");
  tagsEl.innerHTML = (item.tags || "").split(",").map(t => `<span class="tag">${t.trim()}</span>`).join("");
  const likeBtn = bg.querySelector(".like-btn");
  likeBtn.textContent = liked ? "♥ Liked" : "♡ Like";
  likeBtn.dataset.id = item.id;
  likeBtn.onclick = () => {
    const nowLiked = toggleLike(item.id);
    likeBtn.textContent = nowLiked ? "♥ Liked" : "♡ Like";
  };
  bg.querySelector(".share-btn").onclick = () => {
    const url = `${location.href.split("?")[0]}?id=${item.id}`;
    navigator.clipboard?.writeText(url).then(() => showToast("🔗 Link copied!"));
  };
  bg.querySelector(".dl-btn").onclick = () => {
    const a = document.createElement("a");
    a.href = item.image; a.download = item.title + ".jpg"; a.click();
  };
  bg.classList.add("open");
  document.body.style.overflow = "hidden";
  _modalOpen = true;
}
function closeModal() {
  const bg = document.getElementById("modalBg");
  if (!bg) return;
  bg.classList.remove("open");
  document.body.style.overflow = "";
  _modalOpen = false;
}

/* ── Modal HTML snippet — inject once per page ──────────────── */
function injectModal() {
  const html = `
    <div class="modal-bg" id="modalBg">
      <div class="modal" style="position:relative;">
        <button class="modal-close" onclick="closeModal()">✕</button>
        <img class="modal-img" src="" alt="">
        <div class="modal-info">
          <div class="modal-title"></div>
          <div class="modal-artist"></div>
          <div class="modal-cat"></div>
          <div class="modal-desc"></div>
          <div class="modal-tags"></div>
          <div class="modal-actions">
            <button class="btn btn-primary like-btn">♡ Like</button>
            <button class="btn btn-ghost share-btn">🔗 Share</button>
            <button class="btn btn-ghost dl-btn">⬇ Save</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
  document.getElementById("modalBg").addEventListener("click", (e) => {
    if (e.target.id === "modalBg") closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && _modalOpen) closeModal();
  });
}

/* ── Toast HTML snippet ─────────────────────────────────────── */
function injectToast() {
  document.body.insertAdjacentHTML("beforeend", '<div class="toast"></div>');
}

/* ── Scroll reveal ──────────────────────────────────────────── */
function initScrollReveal() {
  if (!window.IntersectionObserver) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "none";
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s, transform 0.6s";
    observer.observe(el);
  });
}

/* ── Active nav link ─────────────────────────────────────────── */
function setActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(a => {
    const href = a.getAttribute("href") || "";
    if (href.includes(path)) a.classList.add("active");
    else a.classList.remove("active");
  });
}

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  spawnStars(80);
  injectModal();
  injectToast();
  setActiveNav();
  setTimeout(initScrollReveal, 100);
});
