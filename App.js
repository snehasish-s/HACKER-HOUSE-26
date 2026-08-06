/* ============================================================
   HH GOA 2026 — Badge Studio Logic
   1080×1080 Canvas Renderer for high-res PNG export.
   Theme: HH Goa 2026 Dark Green + Neon Pink + Golden Yellow
   ============================================================ */

(() => {
  "use strict";

  const CANVAS_SIZE = 1080;

  /* ---- HH Goa Palette ---- */
  const COLORS = {
    paper:    "#F6ECD9",   /* sun-bleached postcard cream */
    paper2:   "#EFE0C2",   /* deeper card stock */
    ink:      "#0A1F12",   /* dark tropical ink */
    inkDim:   "rgba(10,31,18,0.65)",
    greenDeep:"#0A4D2C",   /* dark tropical green */
    green:    "#0E6B3B",   /* main green */
    pink:     "#FF007A",   /* neon pink */
    pinkLight:"#FF3D9A",   /* bright pink */
    yellow:   "#FFD700",   /* golden yellow */
    sea:      "#0E7C7B",   /* lagoon teal */
    mango:    "#F4A93B",   /* mango gold */
    bubble:   "#F2637A",   /* dusk pink */
    white:    "#FFFFFF",
  };

  const TITLES = [
    "Certified Tab-Hoarder", "Full-Time Vibe Debugger", "Professional Coconut Networker",
    "Sunset Merge-Conflict Resolver", "Beach WiFi Warrior", "Chronic Ctrl+S-er",
    "Undefeated Standup Napper", "Latency Whisperer", "Caffeine-to-Code Compiler",
    "Off-Grid, On-Call", "Emotional Support Semicolon", "Certified Shack Shipper",
    "Low-Key Main Character", "Deploy-and-Pray Specialist", "WiFi-Password Diplomat",
    "Sand-in-Laptop Survivor", "Feral Idea Generator", "Group-Chat Architect",
    "Rubber-Duck Whisperer", "Tide-Powered Debugger", "Chief Vibe Officer",
    "404 Sleep Not Found", "Professional Ship-poster", "Palm Tree Philosopher",
    "Midnight Oil Burner", "Goa State of Mind", "Git Push & Chill",
  ];

  const state = {
    format: "frame",      // 'frame' | 'card'
    img: null,            // HTMLImageElement
    zoom: 1,               // 1.0 - 2.6
    pan: { x: 0, y: 0 },   // canvas px
    dragging: false,
    dragStart: null,
    panStart: null,
    name: "",
    role: "Full-Stack / React",
    title: TITLES[0],
    hasRendered: false,
  };

  // ---------- DOM References ----------
  const $ = (id) => document.getElementById(id);
  const dropzone       = $("dropzone");
  const dropzoneTitle   = $("dropzone-title");
  const fileInput       = $("file-input");
  const uploadStatus    = $("upload-status");
  const repositionBlock = $("reposition-block");
  const zoomRange       = $("zoom-range");
  const zoomVal         = $("zoom-val");
  const cardFieldsBlock = $("card-fields-block");
  const nameInput       = $("name-input");
  const roleSelect      = $("role-select");
  const titleChip       = $("title-chip");
  const rerollBtn       = $("reroll-btn");
  const canvas          = $("badge-canvas");
  const ctx             = canvas.getContext("2d");
  const emptyState      = $("empty-state");
  const downloadBtn     = $("download-btn");
  const shareBtn        = $("share-btn");
  const shareStatus     = $("share-status");
  const toastEl         = $("toast");
  const fmtFrameBtn     = $("fmt-frame");
  const fmtCardBtn      = $("fmt-card");
  const step1           = $("step-1");
  const step2           = $("step-2");
  const step3           = $("step-3");

  /* ========== BACKGROUND PARTICLES ========== */
  const particlesCanvas = $("particles-canvas");
  const pCtx = particlesCanvas ? particlesCanvas.getContext("2d") : null;
  const particles = [];

  if (particlesCanvas && pCtx) {
    const resizeP = () => {
      particlesCanvas.width = window.innerWidth;
      particlesCanvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeP);
    resizeP();

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2.5 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.2 + 0.05,
        color: [COLORS.pink, COLORS.yellow, COLORS.white][Math.floor(Math.random() * 3)],
      });
    }

    const animateP = () => {
      pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = particlesCanvas.width;
        if (p.x > particlesCanvas.width) p.x = 0;
        if (p.y < 0) p.y = particlesCanvas.height;
        if (p.y > particlesCanvas.height) p.y = 0;
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fillStyle = p.color;
        pCtx.globalAlpha = p.opacity;
        pCtx.fill();
        pCtx.globalAlpha = 1;
      });
      requestAnimationFrame(animateP);
    };
    animateP();
  }

  /* ========== CONFETTI EFFECT ========== */
  const confettiCanvas = $("confetti-canvas");
  const cCtx = confettiCanvas ? confettiCanvas.getContext("2d") : null;
  let confettiPieces = [];
  let confettiActive = false;

  if (confettiCanvas && cCtx) {
    const resizeC = () => {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeC);
    resizeC();
  }

  function fireConfetti() {
    if (!confettiCanvas || !cCtx) return;
    confettiPieces = [];
    const colors = [COLORS.pink, COLORS.yellow, COLORS.sea, COLORS.white, COLORS.mango];
    for (let i = 0; i < 100; i++) {
      confettiPieces.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight * 0.3,
        w: Math.random() * 10 + 4,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -14 - 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.3 + Math.random() * 0.15,
        opacity: 1,
        decay: 0.006 + Math.random() * 0.008,
      });
    }
    confettiActive = true;
  }

  function animateConfetti() {
    if (!cCtx) return;
    if (confettiActive) {
      cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let alive = 0;
      confettiPieces.forEach(p => {
        if (p.opacity <= 0) return;
        alive++;
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.opacity -= p.decay;
        cCtx.save();
        cCtx.translate(p.x, p.y);
        cCtx.rotate((p.rotation * Math.PI) / 180);
        cCtx.globalAlpha = Math.max(0, p.opacity);
        cCtx.fillStyle = p.color;
        cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        cCtx.restore();
      });
      if (alive === 0) confettiActive = false;
    }
    requestAnimationFrame(animateConfetti);
  }
  if (cCtx) animateConfetti();

  /* ========== TOAST ========== */
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2800);
  }

  /* ========== FORMAT TOGGLE ========== */
  function setFormat(fmt) {
    state.format = fmt;
    fmtFrameBtn.classList.toggle("is-active", fmt === "frame");
    fmtFrameBtn.setAttribute("aria-selected", fmt === "frame");
    fmtCardBtn.classList.toggle("is-active", fmt === "card");
    fmtCardBtn.setAttribute("aria-selected", fmt === "card");
    cardFieldsBlock.hidden = fmt !== "card";
    render();
  }
  fmtFrameBtn.addEventListener("click", () => setFormat("frame"));
  fmtCardBtn.addEventListener("click", () => setFormat("card"));

  /* ========== TITLE REROLL (WITH DICE ANIMATION) ========== */
  function rerollTitle() {
    let next = state.title;
    while (next === state.title) {
      next = TITLES[Math.floor(Math.random() * TITLES.length)];
    }
    state.title = next;
    titleChip.textContent = next;

    // Trigger dice spin animation
    rerollBtn.classList.remove("is-spinning");
    void rerollBtn.offsetWidth; // trigger reflow
    rerollBtn.classList.add("is-spinning");
    setTimeout(() => rerollBtn.classList.remove("is-spinning"), 400);

    render();
  }
  rerollBtn.addEventListener("click", rerollTitle);
  state.title = TITLES[Math.floor(Math.random() * TITLES.length)];
  titleChip.textContent = state.title;

  nameInput.addEventListener("input", () => { state.name = nameInput.value; render(); });
  roleSelect.addEventListener("change", () => { state.role = roleSelect.value; render(); });

  /* ========== UPLOAD HANDLING ========== */
  function isHeic(file) {
    const n = (file.name || "").toLowerCase();
    return file.type === "image/heic" || file.type === "image/heif" || n.endsWith(".heic") || n.endsWith(".heif");
  }

  async function handleFile(file) {
    if (!file || (!file.type.startsWith("image/") && !isHeic(file))) {
      uploadStatus.textContent = "that doesn't look like an image — try a jpg, png or webp";
      return;
    }
    uploadStatus.textContent = "loading your photo…";
    dropzoneTitle.textContent = "hang tight…";

    try {
      let blob = file;
      if (isHeic(file)) {
        uploadStatus.textContent = "converting iPhone photo…";
        blob = await window.heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
      }
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        state.img = img;
        state.zoom = 1;
        state.pan = { x: 0, y: 0 };
        uploadStatus.textContent = "looking good ✓";
        dropzoneTitle.textContent = "drop another to swap it";
        repositionBlock.hidden = false;
        zoomRange.value = 100;
        if (zoomVal) zoomVal.textContent = "1.0×";
        if (step2) step2.classList.add("is-active");
        if (step3) step3.classList.add("is-active");
        downloadBtn.disabled = false;
        shareBtn.disabled = false;
        emptyState.classList.add("is-hidden");
        render();
        fireConfetti();
        toast("badge ready! 🥥 download or share to X");
      };
      img.onerror = () => {
        uploadStatus.textContent = "couldn't read that file — try a different photo";
        dropzoneTitle.textContent = "drop a pic or tap here";
      };
      img.src = url;
    } catch (err) {
      console.error(err);
      uploadStatus.textContent = "conversion failed — try exporting as jpg first";
      dropzoneTitle.textContent = "drop a pic or tap here";
    }
  }

  function openFilePicker() {
    if (fileInput) fileInput.click();
  }

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  });
  dropzone.addEventListener("click", () => openFilePicker());
  dropzone.addEventListener("touchend", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openFilePicker();
  }, { passive: false });
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFilePicker(); }
  });
  ["dragenter", "dragover"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add("is-dragover"); })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove("is-dragover"); })
  );
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  zoomRange.addEventListener("input", () => {
    state.zoom = Number(zoomRange.value) / 100;
    if (zoomVal) zoomVal.textContent = state.zoom.toFixed(1) + "×";
    render();
  });

  /* ========== CANVAS PAN (DRAG TO REPOSITION) ========== */
  function canvasScale() {
    const rect = canvas.getBoundingClientRect();
    return CANVAS_SIZE / rect.width;
  }
  function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scale = canvasScale();
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }
    return { x: (clientX - rect.left) * scale, y: (clientY - rect.top) * scale };
  }

  function startCanvasDrag(e) {
    if (!state.img) return;
    e.preventDefault();
    state.dragging = true;
    state.dragStart = pointerPos(e);
    state.panStart = { ...state.pan };
    if (e.pointerId !== undefined) canvas.setPointerCapture(e.pointerId);
  }

  function moveCanvasDrag(e) {
    if (!state.dragging) return;
    e.preventDefault();
    const p = pointerPos(e);
    state.pan = {
      x: state.panStart.x + (p.x - state.dragStart.x),
      y: state.panStart.y + (p.y - state.dragStart.y),
    };
    render();
  }

  function stopCanvasDrag() {
    state.dragging = false;
  }

  canvas.addEventListener("pointerdown", startCanvasDrag);
  canvas.addEventListener("pointermove", moveCanvasDrag);
  canvas.addEventListener("touchstart", startCanvasDrag, { passive: false });
  canvas.addEventListener("touchmove", moveCanvasDrag, { passive: false });
  ["pointerup", "pointercancel", "pointerleave", "touchend", "touchcancel"].forEach((evt) =>
    canvas.addEventListener(evt, stopCanvasDrag)
  );

  /* ========== DRAWING HELPERS ========== */
  function roundRectPath(c, x, y, w, h, r) {
    if (typeof r === "number") r = { tl: r, tr: r, br: r, bl: r };
    c.beginPath();
    c.moveTo(x + r.tl, y);
    c.lineTo(x + w - r.tr, y);
    c.arcTo(x + w, y, x + w, y + r.tr, r.tr);
    c.lineTo(x + w, y + h - r.br);
    c.arcTo(x + w, y + h, x + w - r.br, y + h, r.br);
    c.lineTo(x + r.bl, y + h);
    c.arcTo(x, y + h, x, y + h - r.bl, r.bl);
    c.lineTo(x, y + r.tl);
    c.arcTo(x, y, x + r.tl, y, r.tl);
    c.closePath();
  }

  function drawCoveredImage(c, img, x, y, w, h, panX, panY, zoom) {
    const scale = Math.max(w / img.width, h / img.height) * zoom;
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const maxPanX = Math.max(0, (drawW - w) / 2);
    const maxPanY = Math.max(0, (drawH - h) / 2);
    const clampedPanX = Math.max(-maxPanX, Math.min(maxPanX, panX));
    const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, panY));
    const cx = x + w / 2 + clampedPanX;
    const cy = y + h / 2 + clampedPanY;
    c.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
    return { clampedPanX, clampedPanY };
  }

  function drawWashiTape(c, x, y, w, h, color, rotationDeg) {
    c.save();
    c.translate(x + w / 2, y + h / 2);
    c.rotate((rotationDeg * Math.PI) / 180);
    c.globalAlpha = 0.88;
    c.fillStyle = color;
    c.fillRect(-w / 2, -h / 2, w, h);
    c.strokeStyle = "rgba(10,31,18,0.3)";
    c.lineWidth = 2;
    c.strokeRect(-w / 2, -h / 2, w, h);
    c.restore();
  }

  function drawDashedLine(c, x1, y1, x2, y2, color, width = 3, dash = [10, 8]) {
    c.save();
    c.strokeStyle = color;
    c.lineWidth = width;
    c.setLineDash(dash);
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.restore();
  }

  function drawDotGrid(c, x, y, cols, rows, cell, color) {
    c.save();
    c.fillStyle = color;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if ((i + j * 3) % 5 !== 0) {
          c.fillRect(x + i * cell, y + j * cell, cell * 0.55, cell * 0.55);
        }
      }
    }
    c.restore();
  }

  /* ========== RENDER: FORMAT A — PFP FRAME ========== */
  function renderFrame() {
    const S = CANVAS_SIZE;
    ctx.clearRect(0, 0, S, S);

    // Sunburnt postcard background with subtle Goa green gradient
    const bgGrad = ctx.createLinearGradient(0, 0, S, S);
    bgGrad.addColorStop(0, COLORS.paper);
    bgGrad.addColorStop(1, COLORS.paper2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, S, S);

    // Photo inset frame (rounded polaroid mount)
    const inset = 36;
    const photoR = 56;
    ctx.save();
    roundRectPath(ctx, inset, inset, S - inset * 2, S - inset * 2, photoR);
    ctx.clip();
    if (state.img) {
      drawCoveredImage(ctx, state.img, inset, inset, S - inset * 2, S - inset * 2, state.pan.x, state.pan.y, state.zoom);
    } else {
      ctx.fillStyle = COLORS.paper2;
      ctx.fillRect(inset, inset, S - inset * 2, S - inset * 2);
    }
    // Gentle vignette
    const grad = ctx.createRadialGradient(S / 2, S / 2, S * 0.28, S / 2, S / 2, S * 0.62);
    grad.addColorStop(0, "rgba(10,31,18,0)");
    grad.addColorStop(1, "rgba(10,31,18,0.28)");
    ctx.fillStyle = grad;
    ctx.fillRect(inset, inset, S - inset * 2, S - inset * 2);
    ctx.restore();

    // Thick neon pink & ink double frame border
    ctx.save();
    roundRectPath(ctx, inset, inset, S - inset * 2, S - inset * 2, photoR);
    ctx.lineWidth = 14;
    ctx.strokeStyle = COLORS.pink;
    ctx.stroke();
    roundRectPath(ctx, inset + 7, inset + 7, S - (inset + 7) * 2, S - (inset + 7) * 2, photoR - 7);
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLORS.ink;
    ctx.stroke();
    ctx.restore();

    // Inner dashed yellow accent ring
    ctx.save();
    roundRectPath(ctx, inset + 24, inset + 24, S - (inset + 24) * 2, S - (inset + 24) * 2, photoR - 24);
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 10]);
    ctx.strokeStyle = COLORS.yellow;
    ctx.stroke();
    ctx.restore();

    // Top arc banner: "HH GOA 2026"
    ctx.save();
    ctx.fillStyle = COLORS.pink;
    roundRectPath(ctx, S / 2 - 270, 54, 540, 88, 44);
    ctx.fill();
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 4;
    roundRectPath(ctx, S / 2 - 270, 54, 540, 88, 44);
    ctx.stroke();
    ctx.fillStyle = COLORS.white;
    ctx.font = "800 44px Fraunces, Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("HH GOA 2026", S / 2, 54 + 44);
    ctx.restore();

    // Bottom hashtag ribbon: "#FRAMEINGOA"
    ctx.save();
    ctx.fillStyle = COLORS.green;
    roundRectPath(ctx, S / 2 - 230, S - 58 - 76, 460, 76, 38);
    ctx.fill();
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 4;
    roundRectPath(ctx, S / 2 - 230, S - 58 - 76, 460, 76, 38);
    ctx.stroke();
    ctx.fillStyle = COLORS.yellow;
    ctx.font = "700 30px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("#FRAMEINGOA", S / 2, S - 58 - 38);
    ctx.restore();

    // Corner postmark stamp: "VERIFIED BUILDER"
    ctx.save();
    ctx.translate(S - 154, 168);
    ctx.rotate((10 * Math.PI) / 180);
    ctx.beginPath();
    ctx.arc(0, 0, 76, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(246,236,217,0.92)";
    ctx.fill();
    ctx.setLineDash([6, 5]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLORS.pink;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.ink;
    ctx.font = "700 15px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("VERIFIED", 0, -8);
    ctx.fillText("BUILDER", 0, 10);
    ctx.font = "700 11px 'Space Mono', monospace";
    ctx.fillStyle = COLORS.pink;
    ctx.fillText("28\u201331 OCT", 0, 30);
    ctx.restore();

    // Washi tape corner accents
    drawWashiTape(ctx, 65, 42, 130, 46, COLORS.yellow, -8);
    drawWashiTape(ctx, S - 215, S - 92, 130, 46, COLORS.pink, 6);
  }

  /* ========== RENDER: FORMAT B — BUILDER ID CARD ========== */
  function renderCard() {
    const S = CANVAS_SIZE;
    ctx.clearRect(0, 0, S, S);

    // Card background
    ctx.fillStyle = COLORS.paper;
    ctx.fillRect(0, 0, S, S);

    const margin = 46;
    ctx.save();
    roundRectPath(ctx, margin, margin, S - margin * 2, S - margin * 2, 30);
    ctx.fillStyle = COLORS.paper2;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = COLORS.ink;
    ctx.stroke();
    ctx.restore();

    // Pink header strip
    const hdrH = 130;
    ctx.save();
    roundRectPath(ctx, margin, margin, S - margin * 2, hdrH, { tl: 30, tr: 30, br: 0, bl: 0 });
    ctx.fillStyle = COLORS.pink;
    ctx.fill();
    ctx.restore();

    // Header text
    ctx.save();
    ctx.fillStyle = COLORS.white;
    ctx.font = "800 46px Fraunces, Georgia, serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("HH GOA", margin + 40, margin + 65);
    ctx.font = "italic 700 46px Fraunces, Georgia, serif";
    ctx.fillStyle = COLORS.yellow;
    ctx.fillText("'26", margin + 40 + ctx.measureText("HH GOA ").width + 178, margin + 65);

    ctx.font = "700 15px 'Space Mono', monospace";
    ctx.fillStyle = COLORS.white;
    ctx.textAlign = "right";
    ctx.fillText("BUILDER ID", S - margin - 40, margin + 46);
    ctx.fillText("28\u201331 OCT", S - margin - 40, margin + 78);
    ctx.restore();

    // Photo box
    const photoX = margin + 60;
    const photoY = margin + 168;
    const photoW = S - (margin + 60) * 2;
    const photoH = 430;

    ctx.save();
    roundRectPath(ctx, photoX, photoY, photoW, photoH, 16);
    ctx.clip();
    if (state.img) {
      drawCoveredImage(ctx, state.img, photoX, photoY, photoW, photoH, state.pan.x, state.pan.y, state.zoom);
    } else {
      ctx.fillStyle = COLORS.paper;
      ctx.fillRect(photoX, photoY, photoW, photoH);
    }
    ctx.restore();

    // Photo frame borders
    ctx.save();
    roundRectPath(ctx, photoX, photoY, photoW, photoH, 16);
    ctx.lineWidth = 5;
    ctx.strokeStyle = COLORS.ink;
    ctx.stroke();
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = COLORS.pink;
    roundRectPath(ctx, photoX + 14, photoY + 14, photoW - 28, photoH - 28, 10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Washi tape mounts on photo
    drawWashiTape(ctx, photoX + 20, photoY - 18, 110, 40, COLORS.yellow, -6);
    drawWashiTape(ctx, photoX + photoW - 130, photoY - 18, 110, 40, COLORS.pink, 5);

    // Name text
    const name = (state.name || "your name here").trim();
    ctx.save();
    ctx.fillStyle = COLORS.ink;
    ctx.font = "700 52px Kalam, cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(name, S / 2, photoY + photoH + 78);
    ctx.restore();

    // Role pill
    ctx.save();
    ctx.font = "700 22px 'Space Mono', monospace";
    const roleText = state.role.toUpperCase();
    const roleW = ctx.measureText(roleText).width + 56;
    roundRectPath(ctx, S / 2 - roleW / 2, photoY + photoH + 100, roleW, 52, 26);
    ctx.fillStyle = COLORS.green;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = COLORS.ink;
    ctx.stroke();
    ctx.fillStyle = COLORS.yellow;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(roleText, S / 2, photoY + photoH + 100 + 27);
    ctx.restore();

    // Dashed tear line
    const tearY = photoY + photoH + 178;
    drawDashedLine(ctx, margin + 24, tearY, S - margin - 24, tearY, COLORS.pink, 3, [12, 8]);
    ctx.save();
    ctx.beginPath();
    ctx.arc(margin, tearY, 16, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.paper;
    ctx.fill();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(S - margin, tearY, 16, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.paper;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Builder title chip
    ctx.save();
    ctx.font = "700 26px Kalam, cursive";
    const titleText = state.title;
    const titleW = Math.min(S - margin * 2 - 60, ctx.measureText(titleText).width + 70);
    roundRectPath(ctx, S / 2 - titleW / 2, tearY + 26, titleW, 56, 12);
    ctx.fillStyle = COLORS.yellow;
    ctx.globalAlpha = 0.45;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = COLORS.pink;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLORS.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(titleText, S / 2, tearY + 26 + 30);
    ctx.restore();

    // Footer: coords + dot grid + hashtag
    const footerY = tearY + 106;
    ctx.save();
    ctx.font = "700 15px 'Space Mono', monospace";
    ctx.fillStyle = COLORS.inkDim;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("15.2993\u00b0N  74.1240\u00b0E", margin + 40, footerY);
    ctx.fillStyle = COLORS.pink;
    ctx.font = "700 18px 'Space Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText("#FRAMEINGOA", S - margin - 40, footerY);
    ctx.restore();
    drawDotGrid(ctx, S / 2 - 60, footerY - 12, 22, 3, 5.5, COLORS.ink);
  }

  function render() {
    if (state.format === "frame") renderFrame(); else renderCard();
    state.hasRendered = !!state.img;
  }

  // ---------- Wait for webfonts before initial render ----------
  function bootRender() {
    render();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(render);
    }
  }
  bootRender();

  // ---------- Download PNG ----------
  function currentFilename() {
    const tag = state.format === "frame" ? "pfp-frame" : "builder-id";
    return `hhgoa2026-${tag}.png`;
  }

  function canvasToBlob() {
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
  }

  downloadBtn.addEventListener("click", async () => {
    if (!state.img) return;
    const blob = await canvasToBlob();
    if (!blob) { toast("couldn't generate the image — try again"); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentFilename();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    fireConfetti();
    toast("saved ✓ now go post it!");
  });

  // ---------- Share to X ----------
  function buildShareCaption() {
    const name = (state.name || "").trim();
    const descriptor = state.format === "card"
      ? `${name ? `${name} is showing off their` : "I’m showing off my"} Builder ID for HH GOA 2026`
      : `${name ? `${name} is showing off their` : "I’m showing off my"} PFP frame for HH GOA 2026`;

    return `${descriptor} ✨ #FrameInGoa #HHGOA2026`;
  }

  shareBtn.addEventListener("click", async () => {
    if (!state.img) return;

    const caption = buildShareCaption();
    const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(caption)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    shareStatus.textContent = "opening X composer…";
    toast("opening X composer ✨");
  });
})();