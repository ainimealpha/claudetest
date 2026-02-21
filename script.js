// ============================================================
//  GALLERY CODEX v2 — Shared Script
//  Features: stars, modal, toast, likes, watermark download,
//            dark/light mode, refresh, pull-to-refresh
// ============================================================

/* ── Stars ──────────────────────────────────────────────────── */
function spawnStars(count = 60) {
  const c = document.querySelector(".stars");
  if (!c) return;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "star";
    const size = Math.random() * 2.2 + 0.5;
    s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--dur:${Math.random()*3+2}s;animation-delay:${Math.random()*4}s`;
    c.appendChild(s);
  }
}

/* ── Loading Screen ─────────────────────────────────────────── */
function hideLoader() {
  const el = document.getElementById("loadingScreen");
  if (el) el.classList.add("done");
}

/* ── Toast ──────────────────────────────────────────────────── */
function showToast(msg) {
  const t = document.querySelector(".toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ── Likes ──────────────────────────────────────────────────── */
function getLikes() {
  try { return JSON.parse(localStorage.getItem("codex_likes") || "[]"); } catch { return []; }
}
function toggleLike(id) {
  const likes = getLikes();
  const i = likes.indexOf(id);
  if (i > -1) { likes.splice(i, 1); showToast("✦ Removed from favorites"); }
  else { likes.push(id); showToast("♥ Added to favorites!"); }
  localStorage.setItem("codex_likes", JSON.stringify(likes));
  return i === -1;
}
function isLiked(id) { return getLikes().includes(id); }

/* ── Dark / Light Mode ──────────────────────────────────────── */
function getTheme() {
  return localStorage.getItem("codex_theme") || "dark";
}
function applyTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  localStorage.setItem("codex_theme", theme);
  // update all theme buttons
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.textContent = theme === "light" ? "🌙" : "☀️";
    btn.title = theme === "light" ? "Switch to dark mode" : "Switch to light mode";
  });
}
function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
}

/* ── Refresh ────────────────────────────────────────────────── */
function refreshPage() {
  const btn = document.querySelector(".refresh-btn");
  if (btn) {
    btn.classList.remove("spinning");
    void btn.offsetWidth; // reflow
    btn.classList.add("spinning");
    setTimeout(() => btn.classList.remove("spinning"), 750);
  }
  showToast("🔄 Refreshing…");
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent("codex:refresh"));
    showToast("✦ Gallery refreshed!");
  }, 700);
}

/* ── Watermark Download ─────────────────────────────────────── */
function downloadWithWatermark(imgSrc, title) {
  showToast("⏳ Preparing download…");
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");

    // Draw image
    ctx.drawImage(img, 0, 0);

    // Watermark bar at bottom
    const barH = Math.max(36, Math.floor(canvas.height * 0.06));
    const gradient = ctx.createLinearGradient(0, canvas.height - barH, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgba(80,20,160,0.85)");
    gradient.addColorStop(1, "rgba(200,60,140,0.85)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height - barH, canvas.width, barH);

    // Logo text
    const fontSize = Math.max(12, Math.floor(barH * 0.5));
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${fontSize}px 'Cinzel Decorative', serif`;
    ctx.textBaseline = "middle";
    ctx.fillText("✦ Gallery Codex", 14, canvas.height - barH / 2);

    // Site URL
    const urlSize = Math.max(9, Math.floor(barH * 0.34));
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = `${urlSize}px sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText("gallery-codex.github.io", canvas.width - 14, canvas.height - barH / 2);
    ctx.textAlign = "left";

    // Try download
    try {
      canvas.toBlob(blob => {
        if (!blob) { fallbackDownload(imgSrc, title); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = (title || "artwork") + "_GalleryCodex.jpg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("✅ Downloaded with watermark!");
      }, "image/jpeg", 0.92);
    } catch {
      fallbackDownload(imgSrc, title);
    }
  };
  img.onerror = () => fallbackDownload(imgSrc, title);

  // Proxy through cors if needed
  img.src = imgSrc;
}

function fallbackDownload(src, title) {
  // Fallback: open image in new tab
  const a = document.createElement("a");
  a.href = src;
  a.download = (title || "artwork") + ".jpg";
  a.target = "_blank";
  a.click();
  showToast("✅ Opening image…");
}

/* ── Card Builder ───────────────────────────────────────────── */
function buildCard(item, index) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.animationDelay = `${Math.min(index * 0.04, 0.5)}s`;
  card.dataset.id = item.id;
  card.innerHTML = `
    ${item.featured === "true" ? '<span class="card-badge">✦ Featured</span>' : ""}
    <img src="${item.image}" alt="${item.title}" loading="lazy"
         onerror="this.src='https://picsum.photos/seed/${item.id}x/400/560'">
    <div class="card-overlay">
      <div class="card-title">${item.title}</div>
      <div class="card-cat">${item.category || ""}</div>
    </div>
  `;
  card.addEventListener("click", () => openModal(item));
  return card;
}

/* ── Modal ──────────────────────────────────────────────────── */
let _modalOpen = false;
let _currentItem = null;

function openModal(item) {
  _currentItem = item;
  const bg = document.getElementById("modalBg");
  if (!bg) return;

  bg.querySelector(".modal-img").src = item.image;
  bg.querySelector(".modal-img").onerror = function() {
    this.src = `https://picsum.photos/seed/${item.id}x/800/600`;
  };
  bg.querySelector(".modal-title").textContent = item.title;
  bg.querySelector(".modal-artist").textContent = `✦ ${item.artist || "Unknown Artist"}`;
  bg.querySelector(".modal-cat").textContent = item.category || "";
  bg.querySelector(".modal-desc").textContent = item.description || "No description available.";

  const tagsEl = bg.querySelector(".modal-tags");
  tagsEl.innerHTML = (item.tags || "").split(",")
    .map(t => t.trim()).filter(Boolean)
    .map(t => `<span class="tag">${t}</span>`).join("");

  const likeBtn = bg.querySelector(".like-btn");
  const liked = isLiked(item.id);
  likeBtn.textContent = liked ? "♥ Liked" : "♡ Like";
  likeBtn.dataset.id = item.id;
  likeBtn.onclick = () => {
    const nowLiked = toggleLike(item.id);
    likeBtn.textContent = nowLiked ? "♥ Liked" : "♡ Like";
  };

  bg.querySelector(".share-btn").onclick = () => {
    const base = location.href.split("?")[0];
    const url = `${base}?id=${encodeURIComponent(item.id)}`;
    if (navigator.share) {
      navigator.share({ title: item.title, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url)
        .then(() => showToast("🔗 Link copied!"))
        .catch(() => showToast("🔗 Copy the URL to share"));
    }
  };

  bg.querySelector(".dl-btn").onclick = () => {
    downloadWithWatermark(item.image, item.title);
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

function injectModal() {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-bg" id="modalBg">
      <div class="modal" style="position:relative">
        <div class="modal-handle"></div>
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
  `);

  // Close on backdrop
  document.getElementById("modalBg").addEventListener("click", e => {
    if (e.target.id === "modalBg") closeModal();
  });

  // Close on Escape
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && _modalOpen) closeModal();
  });

  // Swipe down to close (mobile)
  const modal = document.querySelector(".modal");
  let startY = 0, dragging = false;
  modal.addEventListener("touchstart", e => {
    startY = e.touches[0].clientY;
    dragging = true;
  }, { passive: true });
  modal.addEventListener("touchmove", e => {
    if (!dragging) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0 && modal.scrollTop === 0) {
      modal.style.transform = `translateY(${dy}px)`;
    }
  }, { passive: true });
  modal.addEventListener("touchend", e => {
    dragging = false;
    const dy = e.changedTouches[0].clientY - startY;
    if (dy > 80 && modal.scrollTop === 0) {
      closeModal();
    }
    modal.style.transform = "";
  }, { passive: true });
}

/* ── Toast injection ─────────────────────────────────────────── */
function injectToast() {
  document.body.insertAdjacentHTML("beforeend", '<div class="toast"></div>');
}

/* ── Pull-to-Refresh ────────────────────────────────────────── */
function initPullToRefresh() {
  if (window.matchMedia("(hover: hover)").matches) return; // desktop skip
  let startY = 0, triggered = false;
  const indicator = document.createElement("div");
  indicator.className = "ptr-indicator";
  indicator.innerHTML = '<span class="ptr-spin">↻</span> Pull to refresh';
  document.body.appendChild(indicator);

  document.addEventListener("touchstart", e => {
    startY = e.touches[0].clientY;
    triggered = false;
  }, { passive: true });

  document.addEventListener("touchmove", e => {
    if (document.documentElement.scrollTop > 0) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 55 && !triggered) {
      indicator.classList.add("visible");
    }
  }, { passive: true });

  document.addEventListener("touchend", e => {
    const dy = e.changedTouches[0].clientY - startY;
    if (dy > 100 && document.documentElement.scrollTop === 0 && !triggered) {
      triggered = true;
      refreshPage();
    }
    setTimeout(() => indicator.classList.remove("visible"), 500);
  }, { passive: true });
}

/* ── Scroll reveal ──────────────────────────────────────────── */
function initScrollReveal() {
  if (!window.IntersectionObserver) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("revealed"));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("revealed");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
}

/* ── Active nav ─────────────────────────────────────────────── */
function setActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link, .bnav-item").forEach(a => {
    const href = (a.getAttribute("href") || a.dataset.href || "");
    if (href.includes(path) || (path === "index.html" && href === "index.html")) {
      a.classList.add("active");
    } else {
      a.classList.remove("active");
    }
  });
}

/* ── URL param: open item by id ─────────────────────────────── */
function checkUrlId(allData) {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (!id) return;
  const item = allData.find(d => d.id === id);
  if (item) setTimeout(() => openModal(item), 600);
}

/* ── Init ───────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Apply saved theme immediately
  applyTheme(getTheme());
  spawnStars(60);
  injectModal();
  injectToast();
  setActiveNav();
  initPullToRefresh();
  setTimeout(initScrollReveal, 200);

  // Hide loader after short delay
  setTimeout(hideLoader, 1500);
});
