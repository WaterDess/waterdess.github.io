(function () {
  const canvas = document.querySelector(".motion-demo-canvas");
  const hero = document.querySelector(".motion-demo-hero");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionOff = new URLSearchParams(window.location.search).get("motion") === "off";

  if (!canvas || !hero) {
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: false });
  const image = new Image();
  image.decoding = "async";
  image.src = canvas.dataset.src;

  let width = 1;
  let height = 1;
  let dpr = 1;
  let cover = { sx: 0, sy: 0, sw: 1, sh: 1, dx: 0, dy: 0, dw: 1, dh: 1 };
  let frameId = 0;
  let frames = 0;

  function random(seed) {
    let state = seed >>> 0;
    return function next() {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  const nextRandom = random(2026062602);
  const mistCells = Array.from({ length: 24 }, () => {
    const isNear = nextRandom() > 0.56;
    const y = isNear ? 0.08 + nextRandom() * 0.2 : 0.3 + nextRandom() * 0.28;

    return {
      x: nextRandom(),
      y,
      rx: isNear ? 0.16 + nextRandom() * 0.25 : 0.14 + nextRandom() * 0.24,
      ry: isNear ? 0.025 + nextRandom() * 0.05 : 0.022 + nextRandom() * 0.04,
      speed: isNear ? 0.0045 + nextRandom() * 0.0035 : 0.0011 + nextRandom() * 0.0017,
      alpha: isNear ? 0.014 + nextRandom() * 0.025 : 0.018 + nextRandom() * 0.034,
      phase: nextRandom() * Math.PI * 2,
      isNear
    };
  });

  function resize() {
    const rect = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    calculateCover();
  }

  function calculateCover() {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = width / height;

    if (!image.naturalWidth || !image.naturalHeight) {
      return;
    }

    if (imageRatio > canvasRatio) {
      const sw = image.naturalHeight * canvasRatio;
      cover = {
        sx: (image.naturalWidth - sw) / 2,
        sy: 0,
        sw,
        sh: image.naturalHeight,
        dx: 0,
        dy: 0,
        dw: width,
        dh: height
      };
    } else {
      const sh = image.naturalWidth / canvasRatio;
      cover = {
        sx: 0,
        sy: (image.naturalHeight - sh) / 2,
        sw: image.naturalWidth,
        sh,
        dx: 0,
        dy: 0,
        dw: width,
        dh: height
      };
    }
  }

  function drawBase() {
    ctx.drawImage(image, cover.sx, cover.sy, cover.sw, cover.sh, cover.dx, cover.dy, cover.dw, cover.dh);
  }

  function drawWaterTone(time) {
    const waterTop = Math.floor(height * 0.58);
    const waterBottom = height;
    const reflection = ctx.createLinearGradient(0, waterTop, 0, waterBottom);

    reflection.addColorStop(0, "rgba(255,255,255,0)");
    reflection.addColorStop(0.42, "rgba(210,235,231,0.018)");
    reflection.addColorStop(0.74, "rgba(177,214,213,0.032)");
    reflection.addColorStop(1, "rgba(9,25,26,0.028)");

    ctx.save();
    ctx.fillStyle = reflection;
    ctx.fillRect(0, waterTop, width, waterBottom - waterTop);
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.045;

    for (let i = 0; i < 5; i += 1) {
      const y = waterTop + (i + 1) * (waterBottom - waterTop) / 6;
      const drift = Math.sin(time * 0.12 + i * 1.7) * width * 0.08;
      const sheen = ctx.createRadialGradient(width * 0.48 + drift, y, 0, width * 0.48 + drift, y, width * 0.36);
      sheen.addColorStop(0, "rgba(218,239,235,0.24)");
      sheen.addColorStop(1, "rgba(218,239,235,0)");
      ctx.fillStyle = sheen;
      ctx.fillRect(0, waterTop, width, waterBottom - waterTop);
    }

    ctx.restore();
  }

  function mistPosition(cell, time) {
    return {
      x: ((cell.x + time * cell.speed) % 1.2 - 0.1) * width,
      y: cell.y * height + Math.sin(time * 0.08 + cell.phase) * (cell.isNear ? 8 : 5)
    };
  }

  function drawMistCell(cell, time, alphaScale, yOverride) {
    const position = mistPosition(cell, time);
    const x = position.x;
    const y = yOverride ?? position.y;
    const rx = cell.rx * width;
    const ry = cell.ry * height;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, rx);

    gradient.addColorStop(0, `rgba(234, 246, 243, ${cell.alpha * alphaScale})`);
    gradient.addColorStop(0.5, `rgba(197, 224, 221, ${cell.alpha * 0.55 * alphaScale})`);
    gradient.addColorStop(1, "rgba(234, 246, 243, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMist(time) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    mistCells.forEach((cell) => drawMistCell(cell, time, 1));
    ctx.restore();
  }

  function drawReflections(time) {
    const waterTop = Math.floor(height * 0.58);
    const horizon = height * 0.48;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, waterTop, width, height - waterTop);
    ctx.clip();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.78;
    mistCells.forEach((cell) => {
      const position = mistPosition(cell, time);
      const mirroredY = waterTop + Math.max(0, position.y - horizon) * 0.52 + (cell.isNear ? 44 : 18);

      if (mirroredY < height * 0.62 || mirroredY > height * 0.94) {
        return;
      }

      drawMistCell(cell, time * 0.96, cell.isNear ? 0.16 : 0.24, mirroredY + Math.sin(time * 0.22 + cell.phase) * 3);
    });
    ctx.restore();
  }

  function render(timestamp) {
    const time = timestamp / 1000;
    drawBase();

    if (!reduceMotion && !motionOff) {
      drawMist(time);
      drawReflections(time);
      drawWaterTone(time);
      frames += 1;
      canvas.dataset.frames = String(frames);
      canvas.dataset.lastTime = time.toFixed(3);
    }

    frameId = window.requestAnimationFrame(render);
  }

  image.addEventListener("load", () => {
    resize();
    render(0);
  });

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(frameId);
  }, { once: true });
})();
