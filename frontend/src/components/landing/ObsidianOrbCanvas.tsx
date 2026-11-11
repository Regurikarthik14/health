import React, { useEffect, useRef } from 'react';

export const ObsidianOrbCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 500);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes for abstract healthcare network
    const nodes: Array<{
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      pulse: number;
      pulseSpeed: number;
    }> = [];

    const nodeCount = 38;
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1.2,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        pulse: Math.random() * Math.PI,
        pulseSpeed: 0.02 + Math.random() * 0.02,
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const orbRadius = Math.min(width, height) * 0.28;

      // 1. Draw connecting healthcare neural web
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        n1.x += n1.vx;
        n1.y += n1.vy;
        n1.pulse += n1.pulseSpeed;

        if (n1.x < 0 || n1.x > width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > height) n1.vy *= -1;

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.18;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        // Draw node dot
        const glow = Math.sin(n1.pulse) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + glow * 0.4})`;
        ctx.beginPath();
        ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw 3D Obsidian Glass Orb
      angle += 0.008;

      // Outer soft glow
      const outerGlow = ctx.createRadialGradient(
        centerX, centerY, orbRadius * 0.8,
        centerX, centerY, orbRadius * 1.4
      );
      outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      outerGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.015)');
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Main Glass Orb Sphere
      const sphereGrad = ctx.createRadialGradient(
        centerX - orbRadius * 0.35,
        centerY - orbRadius * 0.35,
        orbRadius * 0.1,
        centerX,
        centerY,
        orbRadius
      );
      sphereGrad.addColorStop(0, '#2A2A2A');
      sphereGrad.addColorStop(0.3, '#141414');
      sphereGrad.addColorStop(0.7, '#0A0A0A');
      sphereGrad.addColorStop(1, '#050505');

      ctx.fillStyle = sphereGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2);
      ctx.fill();

      // Metallic chrome rim
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner orbital rings (Apple Pro / Automotive glass dashboard inspired)
      ctx.save();
      ctx.translate(centerX, centerY);

      // Ring 1 (tilted)
      ctx.save();
      ctx.rotate(angle * 0.7);
      ctx.beginPath();
      ctx.ellipse(0, 0, orbRadius * 1.15, orbRadius * 0.42, Math.PI / 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Ring 2 (counter-tilted)
      ctx.save();
      ctx.rotate(-angle * 0.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, orbRadius * 1.22, orbRadius * 0.35, -Math.PI / 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(192, 192, 192, 0.09)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Translucent glass highlight crescent
      ctx.beginPath();
      ctx.ellipse(
        -orbRadius * 0.25,
        -orbRadius * 0.3,
        orbRadius * 0.45,
        orbRadius * 0.22,
        -Math.PI / 4,
        0,
        Math.PI * 2
      );
      const highlightGrad = ctx.createLinearGradient(
        -orbRadius * 0.4,
        -orbRadius * 0.4,
        0,
        0
      );
      highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      highlightGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.02)');
      highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGrad;
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-[500px] flex items-center justify-center pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
