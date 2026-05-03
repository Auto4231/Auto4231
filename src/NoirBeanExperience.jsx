import React, { useEffect, useMemo, useRef, useState } from 'react';

const BRAND_POINTS = [
  [0.08, 0.2], [0.16, 0.2], [0.03, 0.5], [0.19, 0.5], [0.03, 0.8], [0.19, 0.8],
  [0.32, 0.2], [0.49, 0.2], [0.32, 0.5], [0.47, 0.5], [0.32, 0.8], [0.49, 0.8],
  [0.57, 0.2], [0.74, 0.2], [0.57, 0.5], [0.72, 0.5], [0.57, 0.8], [0.74, 0.8],
  [0.82, 0.2], [0.98, 0.2], [0.82, 0.5], [0.96, 0.5], [0.82, 0.8], [0.98, 0.8]
];

const rand = (min, max) => Math.random() * (max - min) + min;

export function NoirBeanExperience() {
  const canvasRef = useRef(null);
  const [active, setActive] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const scene = useRef({ particles: [], steam: [], ripple: null, triggerTime: 0 });

  const trigger = () => {
    const now = performance.now();
    scene.current.triggerTime = now;
    scene.current.ripple = { radius: 0, alpha: 0.8 };
    scene.current.particles = Array.from({ length: 800 }, (_, i) => {
      const tx = BRAND_POINTS[i % BRAND_POINTS.length][0];
      const ty = BRAND_POINTS[i % BRAND_POINTS.length][1];
      return {
        x: 0.5 + rand(-0.05, 0.05),
        y: 0.64 + rand(-0.02, 0.01),
        vx: rand(-0.0025, 0.0025),
        vy: rand(-0.022, -0.007),
        tx,
        ty: 0.16 + ty * 0.18,
        size: rand(1.2, 3.8),
        alpha: rand(0.3, 0.9)
      };
    });
    setActive(true);
    setTextVisible(false);
  };

  useEffect(() => {
    let raf;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawnSteam = () => ({
      x: 0.5 + rand(-0.03, 0.03),
      y: 0.62,
      vx: rand(-0.0005, 0.0005),
      vy: rand(-0.0015, -0.0005),
      life: rand(150, 320),
      age: 0,
      size: rand(10, 24)
    });

    scene.current.steam = Array.from({ length: 50 }, spawnSteam);
    fit();
    addEventListener('resize', fit);

    const drawCup = (w, h, t) => {
      const cx = w * 0.5;
      const cy = h * 0.66;
      const glow = 10 + Math.sin(t * 0.003) * 2;
      ctx.shadowBlur = glow;
      ctx.shadowColor = 'rgba(255,197,89,0.72)';
      ctx.strokeStyle = 'rgba(240,190,105,0.92)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - 88, cy - 36, 176, 64, 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 105, cy - 4, 22, -1.2, 1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 66, cy + 30);
      ctx.lineTo(cx + 66, cy + 30);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const animate = (t) => {
      const w = innerWidth;
      const h = innerHeight;

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#030305');
      grad.addColorStop(0.5, '#07090f');
      grad.addColorStop(1, '#020204');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = `rgba(${i % 2 ? '255,185,95' : '60,120,255'},0.05)`;
        ctx.fillRect(((i + 1) * w) / 8, h * 0.62, 24, h * 0.38);
      }
      ctx.globalCompositeOperation = 'source-over';

      scene.current.steam.forEach((s, idx) => {
        s.x += s.vx;
        s.y += s.vy;
        s.age += 1;
        if (s.age > s.life) scene.current.steam[idx] = spawnSteam();
        const alpha = (1 - s.age / s.life) * 0.3;
        ctx.fillStyle = `rgba(236,216,181,${alpha})`;
        ctx.beginPath();
        ctx.ellipse(s.x * w, s.y * h, s.size, s.size * 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      drawCup(w, h, t);

      if (scene.current.ripple) {
        const r = scene.current.ripple;
        r.radius += 5.5;
        r.alpha *= 0.985;
        if (r.alpha < 0.02) scene.current.ripple = null;
        else {
          ctx.strokeStyle = `rgba(201,150,71,${r.alpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(w * 0.5, h * 0.66, r.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      if (active) {
        const elapsed = t - scene.current.triggerTime;
        if (elapsed > 1200) setTextVisible(true);
        if (elapsed > 7000) {
          setActive(false);
          setTextVisible(false);
          scene.current.particles = [];
        }

        scene.current.particles.forEach((p) => {
          const pull = 0.015;
          p.vx += (p.tx - p.x) * pull * 0.08;
          p.vy += (p.ty - p.y) * pull * 0.08;
          p.vx *= 0.965;
          p.vy *= 0.965;
          p.x += p.vx;
          p.y += p.vy;
          const px = p.x * w;
          const py = p.y * h;
          const glow = 6 + Math.sin((px + t) * 0.02) * 2;
          ctx.shadowBlur = glow;
          ctx.shadowColor = 'rgba(255,217,155,0.9)';
          ctx.fillStyle = `rgba(255,206,128,${p.alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', fit);
    };
  }, [active]);

  const overlayClass = useMemo(() => `copy ${textVisible ? 'show' : ''}`, [textVisible]);

  return (
    <main className="screen" onClick={trigger} onTouchStart={trigger}>
      <canvas ref={canvasRef} className="scene" />
      <section className={overlayClass}>
        <h1>NOIR BEAN</h1>
        <h2>BREWING THE NIGHT</h2>
        <p>A new aroma enters the city.</p>
      </section>
      <footer className="hint">Touch to awaken the first cup</footer>
    </main>
  );
}
