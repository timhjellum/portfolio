/* ============================================================
   WEDDINGS & HONEYMOONS: floating lights + fireworks canvas
   (ported from the Disney CodePen). Changes from the pen:
   - exported as initWeddings() and guarded if the markup is missing
   - the animation loop only runs while the scene is on screen
   ============================================================ */
export function initWeddings() {
  const canvas = document.getElementById('fx');
  const scene = document.getElementById('scene');
  if (!canvas || !scene) return;

  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const TAU = Math.PI * 2;
  const IMAGE_ASPECT = 1600 / 971;
  const TARGET_RATIO = 640 / 427;
  const MAX_W = 1280;
  const MAX_H = 854;

  let W = 0;
  let H = 0;
  let rect = { x: 0, y: 0, w: 1, h: 1 };
  let motes = [];
  let fireworks = [];
  let sparks = [];
  let halos = [];

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const firePalettes = [
    ['#ffe9a6', '#ffd06e', '#fff7d9'],
    ['#b6ecff', '#7cb8ff', '#ecf8ff'],
    ['#ffd1ee', '#f0b7ff', '#fff3fd'],
    ['#d7d2ff', '#9dc5ff', '#fff6cb']
  ];

  function resize() {
    const frame = scene.parentElement;
    const viewportW = document.documentElement.clientWidth;
    const viewportH = window.innerHeight;
    let w = Math.min(MAX_W, viewportW);
    let h = w / TARGET_RATIO;
    if (h > Math.min(MAX_H, viewportH)) {
      h = Math.min(MAX_H, viewportH);
      w = h * TARGET_RATIO;
    }
    frame.style.width = `${w}px`;
    frame.style.height = `${h}px`;
    scene.style.width = `${w}px`;
    scene.style.height = `${h}px`;
    W = w;
    H = h;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const iw = Math.min(W, H * IMAGE_ASPECT);
    const ih = iw / IMAGE_ASPECT;
    rect = { x: (W - iw) / 2, y: (H - ih) / 2, w: iw, h: ih };
    motes = Array.from({ length: W < 700 ? 40 : 72 }, makeMote);
  }

  function px(rx, ry) {
    return { x: rect.x + rect.w * rx, y: rect.y + rect.h * ry };
  }

  function makeMote() {
    return {
      rx: rand(0.02, 0.98),
      ry: rand(0.03, 0.92),
      drift: rand(8, 26),
      speed: rand(0.00008, 0.00036),
      phase: rand(0, TAU),
      r: rand(0.7, 2.8),
      o: rand(0.22, 0.9),
      tw: rand(0.7, 2.6),
      c: pick(['rgba(255,239,186,1)', 'rgba(176,231,255,1)', 'rgba(255,206,238,1)', 'rgba(255,223,170,1)'])
    };
  }

  function launchFirework() {
    const target = px(rand(0.6, 0.92), rand(0.08, 0.33));
    const start = px(rand(0.68, 0.95), rand(0.62, 0.82));
    fireworks.push({
      x: start.x,
      y: start.y,
      tx: target.x,
      ty: target.y,
      vx: (target.x - start.x) / rand(34, 46),
      vy: (target.y - start.y) / rand(34, 46),
      trail: [],
      color: pick(firePalettes)
    });
  }

  function burst(x, y, palette) {
    const count = Math.floor(rand(42, 68));
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU);
      const sp = rand(0.9, 4.3);
      sparks.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: rand(42, 72),
        maxLife: 72,
        drag: rand(0.972, 0.986),
        grav: rand(0.012, 0.03),
        size: rand(1.2, 2.6),
        color: pick(palette)
      });
    }
    halos.push({ x, y, r: 2, max: rand(40, 66), life: 22, color: pick(palette) });
  }

  let nextLaunch = 0;
  let running = false;
  let rafId = 0;

  function update(time) {
    ctx.clearRect(0, 0, W, H);

    // floating lights
    for (const m of motes) {
      m.ry -= m.speed;
      if (m.ry < -0.04) {
        m.rx = rand(0.03, 0.97);
        m.ry = 1.02;
        m.phase = rand(0, TAU);
      }
      m.phase += 0.01;
      const p = px(m.rx, m.ry);
      const x = p.x + Math.sin(time * 0.0005 * m.tw + m.phase) * m.drift;
      const y = p.y + Math.cos(time * 0.0003 + m.phase) * 2;
      const alpha = m.o * (0.62 + Math.sin(time * 0.0012 * m.tw + m.phase) * 0.38);
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      const g = ctx.createRadialGradient(x, y, 0, x, y, m.r * 8);
      g.addColorStop(0, m.c.replace(',1)', ',' + Math.min(1, alpha) + ')'));
      g.addColorStop(0.35, m.c.replace(',1)', ',' + Math.min(0.45, alpha * 0.55) + ')'));
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, m.r * 8, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // launch automatic fireworks
    if (time > nextLaunch) {
      launchFirework();
      nextLaunch = time + rand(1800, 3400);
    }

    // rockets
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const f = fireworks[i];
      f.trail.push([f.x, f.y]);
      if (f.trail.length > 12) f.trail.shift();
      f.x += f.vx;
      f.y += f.vy;
      ctx.save();
      for (let t = 0; t < f.trail.length; t++) {
        const [tx, ty] = f.trail[t];
        ctx.globalAlpha = ((t + 1) / f.trail.length) * 0.35;
        ctx.fillStyle = '#fff8e0';
        ctx.beginPath();
        ctx.arc(tx, ty, 1.4 + t * 0.05, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      ctx.save();
      ctx.fillStyle = '#fff5c9';
      ctx.shadowColor = '#fff3c2';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 2.2, 0, TAU);
      ctx.fill();
      ctx.restore();
      if (Math.hypot(f.tx - f.x, f.ty - f.y) < 10) {
        burst(f.tx, f.ty, f.color);
        fireworks.splice(i, 1);
      }
    }

    // sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life -= 1;
      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      s.vx *= s.drag;
      s.vy = s.vy * s.drag + s.grav;
      s.x += s.vx;
      s.y += s.vy;
      const a = s.life / s.maxLife;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * a + 0.3, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    // halos
    for (let i = halos.length - 1; i >= 0; i--) {
      const h = halos[i];
      h.life -= 1;
      h.r += (h.max - h.r) * 0.18;
      if (h.life <= 0) {
        halos.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = (h.life / 24) * 0.28;
      ctx.strokeStyle = h.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    rafId = running ? requestAnimationFrame(update) : 0;
  }

  // only animate while the scene is on screen (saves CPU/battery elsewhere on the page)
  new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting;
    if (running && !rafId) {
      nextLaunch = performance.now() + 600;
      rafId = requestAnimationFrame(update);
    }
  }).observe(scene);

  window.addEventListener('resize', resize, { passive: true });
  resize();
}
