/* ============================================================
   HH GOA 2026 — Badge Studio Logic
   1080×1080 Canvas Renderer for high-res PNG export.
   Theme: HH Goa 2026 Dark Green + Neon Pink + Golden Yellow
   ============================================================ */

(() => {
  "use strict";

  const CANVAS_SIZE = 1080;
  const FRAME_ASSET = "builder-pass-frame.png.jpeg";

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

  function createRegistrationNumber() {
    return `HHG-26-${Math.floor(100000 + Math.random() * 900000)}`;
  }

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
    stack: ["", "", "", ""],
    registration: createRegistrationNumber(),
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
  const stackInputs     = [1, 2, 3, 4].map((index) => $(`stack-input-${index}`));
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
  const frameImage      = new Image();
  frameImage.src = FRAME_ASSET;

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
  stackInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      state.stack[index] = input.value;
      render();
    });
  });

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
    return canvas.width / rect.width;
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

  function drawVerificationCode(c, x, y, size, value) {
    const cells = 13;
    const cell = size / cells;
    let seed = 0;
    for (const character of value) seed = (seed * 31 + character.charCodeAt(0)) >>> 0;
    c.save();
    c.fillStyle = COLORS.paper;
    c.fillRect(x, y, size, size);
    c.strokeStyle = COLORS.ink;
    c.lineWidth = 4;
    c.strokeRect(x, y, size, size);
    c.fillStyle = COLORS.ink;
    for (let row = 0; row < cells; row++) {
      for (let column = 0; column < cells; column++) {
        const finder = (column < 5 && row < 5) || (column > 7 && row < 5) || (column < 5 && row > 7);
        const edge = column === 0 || column === 4 || row === 0 || row === 4;
        const center = column >= 1 && column <= 3 && row >= 1 && row <= 3;
        const bit = ((seed >>> ((row * cells + column) % 24)) & 1) === 1;
        if ((finder && (edge || center)) || (!finder && bit)) {
          c.fillRect(x + column * cell, y + row * cell, Math.ceil(cell), Math.ceil(cell));
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

    ctx.save();
    ctx.fillStyle = COLORS.ink;
    roundRectPath(ctx, 690, 50, 300, 52, 8);
    ctx.fill();
    ctx.fillStyle = COLORS.yellow;
    ctx.font = "700 19px 'Space Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.registration, 840, 76);
    ctx.restore();
  }

  /* ========== RENDER: FORMAT B — BUILDER ID CARD ========== */
  function renderCard() {
    let W = frameImage.naturalWidth || 1024;
    let H = frameImage.naturalHeight || 1536;
    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    if (frameImage.complete && frameImage.naturalWidth) {
      ctx.drawImage(frameImage, 0, 0, W, H);

      // The supplied JPEG is the finished pass; only replace its blank portrait window.
      if (state.img) {
        const photoX = 345, photoY = 449, photoW = 334, photoH = 365;
        ctx.save();
        roundRectPath(ctx, photoX, photoY, photoW, photoH, 28);
        ctx.clip();
        drawCoveredImage(ctx, state.img, photoX, photoY, photoW, photoH, state.pan.x, state.pan.y, state.zoom);
        ctx.restore();
      }

      const liveText = (value, x, y, font, color = COLORS.ink, align = "left") => {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = "middle";
        ctx.fillText(value, x, y);
      };
      if (state.name) {
        liveText(state.name.toUpperCase(), 210, 945, "800 40px Outfit, sans-serif");
        liveText(state.role.toUpperCase(), 210, 984, "700 34px 'Space Mono', monospace", COLORS.green);
      }
      liveText(state.registration, 868, 58, "700 14px 'Space Mono', monospace", COLORS.paper, "center");
      const stackBoxes = [140, 300, 460, 620];
      state.stack.forEach((value, index) => {
        if (value.trim()) liveText(value.trim().toUpperCase(), stackBoxes[index] + 70, 1245, "700 16px 'Space Mono', monospace", COLORS.ink, "center");
      });
      drawVerificationCode(ctx, 48, 1420, 106, `${state.name}|${state.role}|${state.stack.join("|")}|HHGOA2026`);
      let titleSize = 22;
      const titleText = state.title.toUpperCase();
      ctx.font = `800 ${titleSize}px Outfit, sans-serif`;
      while (ctx.measureText(titleText).width > 350 && titleSize > 14) {
        titleSize -= 1;
        ctx.font = `800 ${titleSize}px Outfit, sans-serif`;
      }
      liveText(titleText, 205, 1150, `800 ${titleSize}px Outfit, sans-serif`, COLORS.paper);
      return;
    }

    W = 900;
    H = 1350;
    const margin = 28;
    ctx.fillStyle = COLORS.paper;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 6;
    roundRectPath(ctx, margin, margin, W - margin * 2, H - margin * 2, 22);
    ctx.stroke();

    const text = (value, x, y, font, color = COLORS.ink, align = "left") => {
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      ctx.fillText(value, x, y);
    };
    const band = (x, y, w, h, color, radius = 10) => {
      ctx.fillStyle = color;
      roundRectPath(ctx, x, y, w, h, radius);
      ctx.fill();
    };

    ctx.fillStyle = COLORS.ink;
    ctx.fillRect(margin, margin, W - margin * 2, 66);
    text("OFFICIAL BUILDER PASS", 54, 62, "700 22px 'Space Mono', monospace", COLORS.paper);
    band(380, 0, 140, 166, COLORS.pink, 0);
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 5;
    ctx.strokeRect(380, 0, 140, 166);
    text("HH", 450, 48, "800 34px Outfit, sans-serif", COLORS.yellow, "center");
    text("GOA", 450, 84, "800 34px Outfit, sans-serif", COLORS.yellow, "center");
    text("2026", 450, 126, "800 28px 'Space Mono', monospace", COLORS.paper, "center");

    text("HACKER HOUSE", W / 2, 258, "800 78px Fraunces, Georgia, serif", COLORS.ink, "center");
    band(228, 304, 444, 52, COLORS.ink, 4);
    text("GOA", 270, 330, "800 30px Outfit, sans-serif", COLORS.paper, "center");
    band(330, 304, 120, 52, COLORS.pink, 0);
    text("2026", 390, 330, "800 30px Outfit, sans-serif", COLORS.paper, "center");
    text("BUILD  •  SHIP  •  REPEAT", 584, 330, "800 20px 'Space Mono', monospace", COLORS.ink, "center");

    // Reference artwork: Goa landscape, side date rail, and verification seal.
    ctx.fillStyle = COLORS.ink;
    ctx.fillRect(28, 380, 72, 440);
    ctx.save();
    ctx.translate(64, 760);
    ctx.rotate(-Math.PI / 2);
    text("GOA, INDIA  •  OCT 28–31, 2026", 0, 0, "700 15px 'Space Mono', monospace", COLORS.paper, "center");
    ctx.restore();
    ctx.fillStyle = COLORS.yellow;
    ctx.beginPath();
    ctx.arc(64, 415, 7, 0, Math.PI * 2);
    ctx.fill();

    // Lighthouse silhouette.
    ctx.fillStyle = COLORS.pink;
    ctx.beginPath();
    ctx.moveTo(122, 688); ctx.lineTo(208, 688); ctx.lineTo(194, 512); ctx.lineTo(140, 512); ctx.closePath(); ctx.fill();
    ctx.fillStyle = COLORS.ink;
    ctx.fillRect(133, 486, 68, 30);
    ctx.fillRect(153, 456, 28, 30);
    ctx.beginPath(); ctx.arc(167, 449, 18, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 7;
    for (let y = 535; y < 670; y += 30) {
      ctx.beginPath(); ctx.moveTo(132, y); ctx.lineTo(198, y - 8); ctx.stroke();
    }
    ctx.fillStyle = COLORS.green;
    ctx.beginPath(); ctx.moveTo(104, 692); ctx.quadraticCurveTo(168, 650, 244, 694); ctx.lineTo(244, 758); ctx.lineTo(104, 758); ctx.closePath(); ctx.fill();

    // Palm and sun on the right side of the photo window.
    ctx.fillStyle = COLORS.yellow;
    ctx.beginPath(); ctx.arc(762, 570, 86, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 13;
    ctx.beginPath(); ctx.moveTo(770, 758); ctx.quadraticCurveTo(760, 660, 786, 530); ctx.stroke();
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(786, 538); ctx.quadraticCurveTo(730, 476, 694, 490); ctx.moveTo(786, 538); ctx.quadraticCurveTo(776, 460, 792, 432); ctx.moveTo(786, 538); ctx.quadraticCurveTo(840, 478, 884, 492); ctx.moveTo(786, 538); ctx.quadraticCurveTo(852, 528, 892, 562); ctx.stroke();
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath(); ctx.moveTo(706, 760); ctx.lineTo(755, 620); ctx.lineTo(797, 760); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = COLORS.yellow;
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(758, 720); ctx.lineTo(773, 680); ctx.lineTo(758, 686); ctx.lineTo(778, 646); ctx.stroke();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 5;
    for (let y = 704; y < 762; y += 22) {
      ctx.beginPath(); ctx.moveTo(104, y); ctx.quadraticCurveTo(150, y - 18, 200, y); ctx.quadraticCurveTo(250, y + 18, 300, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(650, y); ctx.quadraticCurveTo(700, y - 18, 750, y); ctx.quadraticCurveTo(800, y + 18, 844, y); ctx.stroke();
    }

    // Verified builder seal.
    ctx.save();
    ctx.translate(752, 238);
    ctx.rotate(0.15);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, 0, 65, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = COLORS.pink;
    ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.stroke();
    text("VERIFIED", 0, -22, "700 15px 'Space Mono', monospace", COLORS.ink, "center");
    text("BUILDER", 0, 38, "700 15px 'Space Mono', monospace", COLORS.ink, "center");
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath(); ctx.moveTo(-18, -4); ctx.lineTo(0, 10); ctx.lineTo(24, -20); ctx.lineTo(14, -24); ctx.lineTo(0, -4); ctx.lineTo(-12, -14); ctx.closePath(); ctx.fill();
    ctx.restore();

    const photoX = 238, photoY = 410, photoW = 424, photoH = 350;
    ctx.save();
    roundRectPath(ctx, photoX, photoY, photoW, photoH, 34);
    ctx.clip();
    if (state.img) drawCoveredImage(ctx, state.img, photoX, photoY, photoW, photoH, state.pan.x, state.pan.y, state.zoom);
    else { ctx.fillStyle = COLORS.paper2; ctx.fillRect(photoX, photoY, photoW, photoH); }
    ctx.restore();
    ctx.lineWidth = 10;
    ctx.strokeStyle = COLORS.pink;
    roundRectPath(ctx, photoX, photoY, photoW, photoH, 34);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.strokeStyle = COLORS.ink;
    roundRectPath(ctx, photoX + 12, photoY + 12, photoW - 24, photoH - 24, 26);
    ctx.stroke();
    band(538, 394, 138, 48, COLORS.ink, 12);
    text("● ACTIVE", 607, 418, "700 18px 'Space Mono', monospace", COLORS.yellow, "center");

    band(104, 808, 692, 154, COLORS.paper, 28);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 6;
    roundRectPath(ctx, 104, 808, 692, 154, 28);
    ctx.stroke();
    text("●  BUILDER IDENTITY", 138, 846, "700 20px 'Space Mono', monospace", COLORS.pink);
    text((state.name || "YOUR NAME HERE").toUpperCase(), 138, 900, "800 30px Outfit, sans-serif", COLORS.ink);
    text(state.role.toUpperCase(), 138, 932, "700 15px 'Space Mono', monospace", COLORS.green);

    band(102, 984, 600, 102, COLORS.ink, 18);
    text("✦  AI TITLE", 132, 1020, "700 18px 'Space Mono', monospace", COLORS.yellow);
    text(state.title.toUpperCase(), 132, 1054, "700 20px Outfit, sans-serif", COLORS.paper);
    band(706, 984, 92, 102, COLORS.paper, 18);
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 5;
    roundRectPath(ctx, 706, 984, 92, 102, 18);
    ctx.stroke();
    text(">_", 752, 1040, "700 28px 'Space Mono', monospace", COLORS.ink, "center");

    // Approval stamp overlaps the lower information blocks like the supplied pass.
    ctx.save();
    ctx.translate(724, 1008);
    ctx.rotate(-0.22);
    ctx.strokeStyle = COLORS.pink;
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(0, 0, 88, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 78, 0, Math.PI * 2); ctx.stroke();
    text("GOA • 2026", 0, -40, "700 18px 'Space Mono', monospace", COLORS.pink, "center");
    text("OFFICIALLY", 0, -6, "800 22px Outfit, sans-serif", COLORS.pink, "center");
    band(-94, 10, 188, 40, COLORS.pink, 3);
    text("APPROVED", 0, 30, "800 22px Outfit, sans-serif", COLORS.paper, "center");
    ctx.restore();

    text("PRIMARY STACK", 104, 1122, "700 16px 'Space Mono', monospace", COLORS.pink);
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = COLORS.mango;
      ctx.lineWidth = 3;
      roundRectPath(ctx, 198 + i * 142, 1100, 124, 42, 10);
      ctx.stroke();
    }
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(56, 1180); ctx.lineTo(844, 1180); ctx.stroke();
    text("BUILDS", 180, 1218, "800 20px Outfit, sans-serif", COLORS.ink, "center");
    text("SHIP MODE", 450, 1218, "800 20px Outfit, sans-serif", COLORS.ink, "center");
    text("VIBES", 720, 1218, "800 20px Outfit, sans-serif", COLORS.ink, "center");
    text("∞", 180, 1250, "800 38px Fraunces, Georgia, serif", COLORS.pink, "center");
    text("ON", 450, 1250, "800 28px Outfit, sans-serif", COLORS.pink, "center");
    text("HIGH", 720, 1250, "800 28px Outfit, sans-serif", COLORS.pink, "center");
    // Small sailing mark in the lower-right corner.
    ctx.fillStyle = COLORS.ink;
    ctx.beginPath(); ctx.moveTo(760, 1280); ctx.lineTo(806, 1242); ctx.lineTo(806, 1290); ctx.closePath(); ctx.fill();
    ctx.fillStyle = COLORS.yellow;
    ctx.beginPath(); ctx.moveTo(812, 1288); ctx.lineTo(842, 1262); ctx.lineTo(842, 1292); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = COLORS.ink;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(806, 1238); ctx.lineTo(806, 1304); ctx.stroke();
    ctx.strokeStyle = COLORS.green;
    ctx.beginPath(); ctx.moveTo(754, 1304); ctx.quadraticCurveTo(800, 1288, 846, 1304); ctx.stroke();
    ctx.fillStyle = COLORS.ink;
    for (let i = 0; i < 34; i++) ctx.fillRect(58 + i * 23, 1290, (i % 3) + 2, 34);
    text("HHG-BUILDER-PASS-2026-VERIFIED", W / 2, 1332, "700 11px 'Space Mono', monospace", COLORS.ink, "center");
  }

  function render() {
    if (state.format === "frame") {
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      renderFrame();
    } else renderCard();
    emptyState.classList.toggle("is-hidden", state.format === "card" || !!state.img);
    state.hasRendered = !!state.img;
  }

  frameImage.addEventListener("load", render);

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
  const RENDER_URL = "https://hacker-house-govaa-26-h8ar.onrender.com";

  function buildShareCaption() {
    const name = (state.name || "").trim();
    const descriptor = state.format === "card"
      ? `${name ? `${name} is showing off their` : "I’m showing off my"} Builder ID for HH GOA 2026`
      : `${name ? `${name} is showing off their` : "I’m showing off my"} PFP frame for HH GOA 2026`;

    return `${descriptor} ✨\n\nBuilt with the HH Goa 2026 frame generator.\n${RENDER_URL}\n\n#FrameInGoa #HHGOA2026 #HackerHouseGoa #GoaBuilders`;
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