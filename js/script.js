// 히어로 망원경 인트로
(function () {
  const heroEl = document.getElementById("hero");
  const heroLayer = document.getElementById("herolayer");
  const lensLayer = document.getElementById("lenslayer");
  const starCanvas = document.getElementById("starbg");
  const lenscanvas = document.getElementById("lenscanvas");
  const replaybtn = document.getElementById("replaybtn");
  const sCtx = lenscanvas.getContext("2d");
  const ctx = starCanvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  let W,
    H,
    stars = [],
    glowStars = [],
    phase = "idle",
    currentR = 0,
    expandProgress = 0;

  function resize() {
    W = heroEl.offsetWidth;
    H = heroEl.offsetHeight;
    starCanvas.width = lenscanvas.width = W * dpr;
    starCanvas.height = lenscanvas.height = H * dpr;
    starCanvas.style.width = lenscanvas.style.width = W + "px";
    starCanvas.style.height = lenscanvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initStars() {
    stars = [];
    glowStars = [];
    // 일반 별 — 은은하게 160개 고정
    for (let i = 0; i < 160; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.0 + 0.2,
        alpha: Math.random() * 0.5 + 0.25,
        twinkleSpeed: Math.random() * 0.018 + 0.004,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: ["#dcd5ff", "#E8E4FF", "#c4b8f5", "#B8D4F5", "#ffffff"][
          Math.floor(Math.random() * 5)
        ],
      });
    }
    // glow별 — 10개만
    for (let i = 0; i < 10; i++) {
      glowStars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 1.0,
        alpha: Math.random() * 0.45 + 0.25,
        twinkleSpeed: Math.random() * 0.012 + 0.004,
        twinkleOffset: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.5 ? 270 : 290,
      });
    }
  }

  let heroT = 0;
  function drawStars() {
    ctx.clearRect(0, 0, W, H);
    heroT += 0.016;
    // 일반 별
    stars.forEach((s) => {
      if (s.r <= 0) return;
      const twinkle =
        Math.sin(heroT * s.twinkleSpeed * 60 + s.twinkleOffset) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha * twinkle;
      ctx.fill();
    });
    // glow 별
    glowStars.forEach((s) => {
      const twinkle =
        Math.sin(heroT * s.twinkleSpeed * 60 + s.twinkleOffset) * 0.4 + 0.6;
      const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 8);
      grd.addColorStop(0, `hsla(${s.hue},80%,80%,${s.alpha * twinkle})`);
      grd.addColorStop(
        0.3,
        `hsla(${s.hue},70%,60%,${s.alpha * twinkle * 0.4})`,
      );
      grd.addColorStop(1, `hsla(${s.hue},60%,50%,0)`);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 8, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.globalAlpha = 1;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue},90%,90%,${twinkle})`;
      ctx.globalAlpha = 1;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawStars);
  }

  function shootStar() {
    if (phase === "idle") return;
    const el = document.createElement("div");
    const angle = Math.random() * 25 + 10;
    const len = Math.random() * 120 + 60;
    const startX = Math.random() * W * 0.7 + W * 0.05;
    const startY = Math.random() * H * 0.45;
    el.style.cssText = `position:absolute;top:${startY}px;left:${startX}px;width:${len}px;height:1.5px;border-radius:99px;background:linear-gradient(90deg,rgba(255,255,255,0.95),transparent);pointer-events:none;z-index:3;transform:rotate(${angle}deg);`;
    heroEl.appendChild(el);
    el.animate(
      [
        { opacity: 0, transform: `translateX(0) rotate(${angle}deg)` },
        { opacity: 1, offset: 0.1 },
        {
          opacity: 0,
          transform: `translateX(${len * 1.5}px) rotate(${angle}deg)`,
        },
      ],
      { duration: 650, easing: "ease-out" },
    ).onfinish = () => el.remove();
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animateValue(from, to, dur, fn, onUpdate, onDone) {
    const s = performance.now();
    function step(now) {
      const t = Math.min((now - s) / dur, 1);
      onUpdate(from + (to - from) * fn(t));
      if (t < 1) requestAnimationFrame(step);
      else if (onDone) onDone();
    }
    requestAnimationFrame(step);
  }

  function drawScope(r, expandProg) {
    sCtx.clearRect(0, 0, W, H);
    if (expandProg >= 1) return;
    const cx = W / 2,
      cy = H / 2;
    const alpha = 1 - expandProg;
    sCtx.save();
    sCtx.globalAlpha = alpha;
    sCtx.beginPath();
    sCtx.rect(0, 0, W, H);
    sCtx.arc(cx, cy, r, 0, Math.PI * 2, true);
    sCtx.fillStyle = "#08060f";
    sCtx.fill();
    const fog = sCtx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
    fog.addColorStop(0, "rgba(0,0,0,0)");
    fog.addColorStop(0.65, "rgba(0,0,0,0.06)");
    fog.addColorStop(1, "rgba(0,0,0,0.5)");
    sCtx.beginPath();
    sCtx.arc(cx, cy, r, 0, Math.PI * 2);
    sCtx.fillStyle = fog;
    sCtx.fill();
    if (r > 2) {
      sCtx.beginPath();
      sCtx.arc(cx, cy, r, 0, Math.PI * 2);
      sCtx.strokeStyle = `rgba(180,140,255,${0.65 * alpha})`;
      sCtx.lineWidth = 2;
      sCtx.stroke();
      sCtx.beginPath();
      sCtx.arc(cx, cy, r + 6, 0, Math.PI * 2);
      sCtx.strokeStyle = `rgba(140,100,220,${0.18 * alpha})`;
      sCtx.lineWidth = 10;
      sCtx.stroke();
    }
    const peekR = Math.min(W, H) * 0.18;
    if (r > peekR * 0.5 && expandProg < 0.1) {
      const la =
        Math.min(1, (r - peekR * 0.5) / (peekR * 0.5)) *
        (1 - expandProg * 8) *
        0.35;
      if (la > 0) {
        sCtx.strokeStyle = `rgba(180,150,255,${la})`;
        sCtx.lineWidth = 1;
        const ll = r * 0.82;
        sCtx.beginPath();
        sCtx.moveTo(cx - ll, cy);
        sCtx.lineTo(cx + ll, cy);
        sCtx.stroke();
        sCtx.beginPath();
        sCtx.moveTo(cx, cy - ll);
        sCtx.lineTo(cx, cy + ll);
        sCtx.stroke();
      }
    }
    sCtx.restore();
  }

  function runIntro() {
    heroLayer.classList.remove("visible");
    lensLayer.style.opacity = "1";
    currentR = 0;
    expandProgress = 0;
    phase = "idle";
    drawScope(0, 0);
    const peekR = Math.min(W, H) * 0.18;
    const maxR = Math.sqrt(W * W + H * H) / 2 + 40;
    setTimeout(() => {
      phase = "peek";
      animateValue(
        0,
        peekR,
        750,
        easeOutCubic,
        (r) => {
          currentR = r;
          drawScope(r, 0);
        },
        () => {
          phase = "hold";
          setTimeout(() => {
            heroLayer.classList.add("visible");
          }, 300);
          setTimeout(() => {
            phase = "expand";
            setTimeout(() => {
              animateValue(
                peekR,
                maxR,
                1100,
                easeInOutCubic,
                (r) => {
                  currentR = r;
                  const prog = (r - peekR) / (maxR - peekR);
                  expandProgress = prog;
                  drawScope(r, prog);
                },
                () => {
                  phase = "done";
                  sCtx.clearRect(0, 0, W, H);
                },
              );
            }, 150);
          }, 2200);
        },
      );
    }, 300);
  }

  replaybtn.addEventListener("click", () => runIntro());
  resize();
  initStars();
  drawStars();
  runIntro();
  (function loop() {
    shootStar();
    setTimeout(loop, Math.random() * 2000 + 1500);
  })();
  window.addEventListener("resize", () => {
    resize();
    initStars();
  });
})();

// cursor
const cursor = document.getElementById("cursor");
let mx = 0,
  my = 0,
  cx = 0,
  cy = 0;
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
});
document
  .querySelectorAll(
    "a, button, .work-card, .brand-card, .etc-card, .sticky-work-item",
  )
  .forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
  });
function animateCursor() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  cursor.style.left = cx + "px";
  cursor.style.top = cy + "px";
  requestAnimationFrame(animateCursor);
}
animateCursor();

// 스크롤 진행 바
const progress = document.getElementById("progress");
window.addEventListener("scroll", () => {
  const pct =
    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  progress.style.width = pct + "%";
});

// 네비 스크롤 효과
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 60);
});

// 섹션 닷 인디케이터
const dots = document.querySelectorAll(".sec-dot");
const sections = [
  "hero",
  "about",
  "pw-intro",
  "uiux",
  "s2",
  "s3",
  "s4",
  "contact",
].map((id) => document.getElementById(id));
dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    document
      .getElementById(dot.dataset.target)
      .scrollIntoView({ behavior: "smooth" });
  });
});
const dotObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = sections.indexOf(entry.target);
        dots.forEach((d, i) => d.classList.toggle("active", i === idx));
      }
    });
  },
  { threshold: 0.4 },
);
sections.forEach((s) => s && dotObserver.observe(s));

// fade-in
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("visible");
    });
  },
  { threshold: 0.15 },
);
document.querySelectorAll(".fade-in").forEach((el) => fadeObserver.observe(el));

// 스킬 바 애니메이션
const barObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.querySelectorAll(".skill-bar-fill").forEach((bar) => {
          bar.style.transform = `scaleX(${bar.dataset.width})`;
          bar.classList.add("animated");
        });
      }
    });
  },
  { threshold: 0.3 },
);
const aboutSection = document.getElementById("about");
if (aboutSection) barObserver.observe(aboutSection);

// Sticky Scroll 연동
const workItems = document.querySelectorAll(".sticky-work-item");
const stickyFrame = document.getElementById("stickyFrame");
const stickyPlaceholder = document.getElementById("stickyPlaceholder");
const stickyImg = document.getElementById("stickyImg"); // ← 추가

function setActiveItem(idx) {
  workItems.forEach((item, i) => item.classList.toggle("active", i === idx));
  const active = workItems[idx];
  stickyFrame.className = "sticky-img-frame " + active.dataset.bg;

  // fade out → src 교체 → fade in
  stickyImg.style.opacity = "0";
  setTimeout(() => {
    stickyImg.src = active.dataset.img;
    stickyImg.alt = active.dataset.label;
    stickyImg.style.opacity = "1";
  }, 200);
}

// 패럴랙스
const stickyContainer = document.querySelector(".sticky-container");
window.addEventListener("scroll", () => {
  if (!stickyContainer) return;
  const rect = stickyContainer.getBoundingClientRect();
  const progress = 1 - rect.bottom / (rect.height + window.innerHeight);
  const move = progress * 30;
  stickyImg.style.transform = `translateY(${move}%)`;
});

const itemObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = [...workItems].indexOf(entry.target);
        if (idx !== -1) setActiveItem(idx);
      }
    });
  },
  { threshold: 0.6, rootMargin: "-20% 0px -20% 0px" },
);
workItems.forEach((item) => itemObserver.observe(item));

workItems.forEach((item, i) => {
  item.addEventListener("click", () => {
    setActiveItem(i);
    item.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

// hero 별 캔버스
const s2canvas = document.getElementById("starsCanvas");
const s2ctx = s2canvas ? s2canvas.getContext("2d") : null;
let s2stars = [];

function resizeS2Canvas() {
  if (!s2canvas) return;
  s2canvas.width = s2canvas.offsetWidth;
  s2canvas.height = s2canvas.offsetHeight;
}

function createS2Stars() {
  if (!s2canvas) return;
  s2stars = [];
  const count = Math.floor((s2canvas.width * s2canvas.height) / 4000);
  for (let i = 0; i < count; i++) {
    s2stars.push({
      x: Math.random() * s2canvas.width,
      y: Math.random() * s2canvas.height,
      r: Math.max(0.1, Math.random() * 1.2 + 0.2),
      alpha: Math.random() * 0.6 + 0.1,
      speed: Math.random() * 0.008 + 0.002,
      offset: Math.random() * Math.PI * 2,
      color: Math.random() > 0.7 ? "#B8D4F5" : "#DCDAF5",
    });
  }
}

let s2frame = 0;
function drawS2Stars() {
  if (!s2canvas || !s2ctx) return;
  s2ctx.clearRect(0, 0, s2canvas.width, s2canvas.height);
  s2frame += 0.01;
  s2stars.forEach((s) => {
    const a =
      s.alpha * (0.6 + 0.4 * Math.sin(s2frame * s.speed * 60 + s.offset));
    s2ctx.beginPath();
    if (s.r <= 0) return;
    s2ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    s2ctx.fillStyle = s.color;
    s2ctx.globalAlpha = a;
    s2ctx.fill();
  });
  s2ctx.globalAlpha = 1;
  requestAnimationFrame(drawS2Stars);
}

resizeS2Canvas();
createS2Stars();
drawS2Stars();
window.addEventListener("resize", () => {
  resizeS2Canvas();
  createS2Stars();
});

// 필터 탭
const filterTabs = document.querySelectorAll(".filter-tab");
const workCards = document.querySelectorAll(".work-card");
filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    filterTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const filter = tab.dataset.filter;
    workCards.forEach((card) => {
      if (filter === "all" || card.dataset.category === filter) {
        card.classList.remove("filtered-out");
      } else {
        card.classList.add("filtered-out");
      }
    });
  });
});

// Project & Works 스크롤 애니메이션
const pwIntro = document.querySelector(".section-pw-intro");
const pwProject = document.getElementById("pw-project");
const pwAmp = document.getElementById("pw-amp");
const pwWorks = document.getElementById("pw-works");
const pwHint = document.getElementById("pw-hint");

window.addEventListener("scroll", () => {
  if (!pwIntro) return;

  const rect = pwIntro.getBoundingClientRect();
  const total = pwIntro.offsetHeight - window.innerHeight;
  // 0 = 진입 시작, 1 = 섹션 끝
  const progress = Math.min(Math.max(-rect.top / total, 0), 1);

  // & 페이드 아웃
  pwAmp.style.opacity = Math.max(0, 1 - progress * 4);

  // Project 왼쪽으로, Works 오른쪽으로
  const spread = progress * 180;
  pwProject.style.transform = `translateX(-${spread}px)`;
  pwWorks.style.transform = `translateX(${spread}px)`;

  // hint 텍스트 페이드 아웃
  pwHint.style.opacity = Math.max(0, 0.35 - progress * 2);
});

// 카드 모달
const backdrop = document.getElementById("cardModalBackdrop"); // ← 위로!
const modalClose = document.getElementById("cardModalClose");

function openModal(data) {
  document.getElementById("cardModalTitle").textContent = data.title;
  document.getElementById("cardModalDesc").textContent = data.desc;
  document.getElementById("cardModalContrib").textContent =
    data.contribution + "%";
  document.getElementById("cardModalPeriod").textContent = data.period;
  document.getElementById("cardModalRole").textContent = data.role;
  document.getElementById("cardModalTools").textContent = data.tools;
  document.getElementById("cardModalContribFill").style.width =
    data.contribution + "%";
  document.getElementById("cardModalThumb");
  const thumb = document.getElementById("cardModalThumb");
  if (data.img) {
    thumb.innerHTML = `<img src="${data.img}" alt="${data.title}" />`;
    thumb.style.background = "";
  } else {
    thumb.innerHTML = "";
    thumb.style.background = "#2d2550";
  }
  requestAnimationFrame(() => {
    thumb.scrollTop = 0;
  });

  // GitHub 버튼
  const githubBtn = document.getElementById("cardModalGithub");
  if (data.github) {
    githubBtn.href = data.github;
    githubBtn.style.display = "inline-flex";
    document.getElementById("cardModalGithubLabel").textContent =
      data.githubLabel;
    document.getElementById("cardModalGithubIcon").className = data.githubIcon;
  } else {
    githubBtn.style.display = "none";
    githubBtn.href = "#";
    document.getElementById("cardModalGithubLabel").textContent = "";
    document.getElementById("cardModalGithubIcon").className = "";
  }

  // 태그
  const tagsEl = document.getElementById("cardModalTags");
  tagsEl.innerHTML = data.tags
    .split(" ")
    .map((t) => `<span class="card-modal-tag">${t}</span>`)
    .join("");

  backdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  backdrop.classList.remove("open");
  document.body.style.overflow = "";
}
document.querySelectorAll(".work-btns .work-link").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const item = btn.closest(".sticky-work-item");
    const url =
      btn.dataset.type === "figma"
        ? item.dataset.figma
        : btn.dataset.type === "process"
          ? item.dataset.process
          : item.dataset.original;
    if (url) window.open(url, "_blank");
  });
});

// work-card, brand-card, etc-card 클릭
document
  .querySelectorAll(".work-card, .brand-card, .etc-card")
  .forEach((card) => {
    if (!card.dataset.title && !card.dataset.link) return;
    card.addEventListener("click", () => {
      if (card.dataset.link) {
        window.open(card.dataset.link, "_blank");
        return;
      }
      openModal({
        title: card.dataset.title,
        desc: card.dataset.desc,
        contribution: card.dataset.contribution || "100",
        period: card.dataset.period || "-",
        role: card.dataset.role || "-",
        tools: card.dataset.tools || "-",
        tags: card.dataset.tags || "",
        img: card.dataset.img || "",
        github: card.dataset.github || "",
        githubLabel: card.dataset.githubLabel || "",
        githubIcon: card.dataset.githubIcon || "",
      });
    });
  });

modalClose.addEventListener("click", closeModal);
backdrop.addEventListener("click", (e) => {
  if (e.target === backdrop) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
