"use client";

import { useEffect, useRef } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
  pz: number;
  screenX: number;
  screenY: number;
  baseRadius: number;
  pulseOffset: number;
  glow: number;
}

export default function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let nodes: Node3D[] = [];
    let isInViewport = false;

    const PRIMARY_COLOR = "#38bdf8";
    const GLOW_COLOR = "rgba(56, 189, 248, ";
    const NODE_COUNT = 36;
    const PERSPECTIVE_DEPTH = 2.5;
    const MAX_DIST_3D = 0.88;

    let rx = 0;
    let ry = 0;
    let autoRx = 0;
    let autoRy = 0;
    let tiltRx = 0;
    let tiltRy = 0;

    let mouseX = 0;
    let mouseY = 0;
    let isHovered = false;

    let currentGlowX = 0;
    let currentGlowY = 0;
    let pulseTime = 0;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionScale = prefersReducedMotion ? 0 : 1;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      currentGlowX = canvas.width / 2;
      currentGlowY = canvas.height / 2;
    }

    function init() {
      nodes = [];
      const phi = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < NODE_COUNT; i++) {
        const y = 1 - (i / (NODE_COUNT - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        nodes.push({
          x,
          y,
          z,
          px: 0,
          py: 0,
          pz: 0,
          screenX: 0,
          screenY: 0,
          baseRadius: 1.2 + (i % 3) * 0.4,
          pulseOffset: (i * 0.55) % (Math.PI * 2),
          glow: 0,
        });
      }
    }

    function draw() {
      if (!canvas || !ctx || !isInViewport) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      let glowRadius = Math.min(canvas.width, canvas.height) * 0.65;
      let maxBgAlpha = 0.05;

      if (isHovered && motionScale > 0) {
        currentGlowX += (mouseX - currentGlowX) * 0.08;
        currentGlowY += (mouseY - currentGlowY) * 0.08;
        maxBgAlpha = 0.07;
      } else {
        currentGlowX += (cx - currentGlowX) * 0.08;
        currentGlowY += (cy - currentGlowY) * 0.08;
      }

      const bgGrad = ctx.createRadialGradient(
        currentGlowX,
        currentGlowY,
        0,
        currentGlowX,
        currentGlowY,
        glowRadius
      );
      bgGrad.addColorStop(0, `${GLOW_COLOR}${maxBgAlpha})`);
      bgGrad.addColorStop(0.5, `${GLOW_COLOR}${maxBgAlpha * 0.35})`);
      bgGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      autoRx += 0.0006 * motionScale;
      autoRy += 0.0014 * motionScale;

      if (isHovered && motionScale > 0) {
        const targetRx = -(mouseY - cy) / cy * 0.35;
        const targetRy = (mouseX - cx) / cx * 0.35;
        tiltRx += (targetRx - tiltRx) * 0.06;
        tiltRy += (targetRy - tiltRy) * 0.06;
      } else {
        tiltRx *= 0.94;
        tiltRy *= 0.94;
      }

      rx = autoRx + tiltRx;
      ry = autoRy + tiltRy;

      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);

      const sphereRadius = Math.min(canvas.width, canvas.height) * 0.38;
      pulseTime += 0.015 * motionScale;

      nodes.forEach((n) => {
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.x * sinY + n.z * cosY;

        const y2 = n.y * cosX - z1 * sinX;
        const z2 = n.y * sinX + z1 * cosX;

        n.px = x1;
        n.py = y2;
        n.pz = z2;

        const f = PERSPECTIVE_DEPTH / (PERSPECTIVE_DEPTH - z2);
        let sx = cx + x1 * sphereRadius * f;
        let sy = cy + y2 * sphereRadius * f;

        if (isHovered && motionScale > 0) {
          const dx = sx - mouseX;
          const dy = sy - mouseY;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);

          if (distToMouse < 75) {
            const influence = 1 - distToMouse / 75;
            n.glow = influence;
            sx += (mouseX - sx) * influence * 0.15;
            sy += (mouseY - sy) * influence * 0.15;
          } else {
            n.glow = 0;
          }
        } else {
          n.glow = 0;
        }

        n.screenX = sx;
        n.screenY = sy;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dz = nodes[i].z - nodes[j].z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D < MAX_DIST_3D) {
            const avgZ = (nodes[i].pz + nodes[j].pz) / 2;
            let alpha = (1 - dist3D / MAX_DIST_3D) * 0.18 * ((avgZ + 1.2) / 2.2);

            const avgGlow = (nodes[i].glow + nodes[j].glow) / 2;
            if (avgGlow > 0) {
              alpha = alpha * (1 - avgGlow) + 0.45 * avgGlow;
            }

            ctx.beginPath();
            ctx.moveTo(nodes[i].screenX, nodes[i].screenY);
            ctx.lineTo(nodes[j].screenX, nodes[j].screenY);

            if (avgGlow > 0) {
              ctx.strokeStyle = `${GLOW_COLOR}${alpha})`;
              ctx.lineWidth = 0.6 + avgGlow * 0.6;
            } else {
              ctx.strokeStyle = `${GLOW_COLOR}${alpha})`;
              ctx.lineWidth = 0.5;
            }
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        const avgZ = (n.pz + 1) / 2;
        const pulse = 0.85 + 0.15 * Math.sin(pulseTime + n.pulseOffset);
        const f = PERSPECTIVE_DEPTH / (PERSPECTIVE_DEPTH - n.pz);
        const renderRadius = n.baseRadius * f * pulse * (1 + n.glow * 0.3);

        const glowAlpha = (0.08 + 0.12 * avgZ) * (1 + n.glow * 0.8);
        const grad = ctx.createRadialGradient(
          n.screenX,
          n.screenY,
          0,
          n.screenX,
          n.screenY,
          renderRadius * 4.5
        );
        grad.addColorStop(0, `${GLOW_COLOR}${glowAlpha})`);
        grad.addColorStop(1, "rgba(56, 189, 248, 0)");

        ctx.beginPath();
        ctx.arc(n.screenX, n.screenY, renderRadius * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.screenX, n.screenY, renderRadius, 0, Math.PI * 2);
        ctx.fillStyle = PRIMARY_COLOR;
        ctx.globalAlpha = (0.35 + 0.65 * avgZ) * (1 + n.glow * 0.25);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animId = requestAnimationFrame(draw);
    }

    resize();
    init();

    const ro = new ResizeObserver(() => {
      resize();
      init();
    });
    ro.observe(canvas);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInViewport = entry.isIntersecting;
          if (isInViewport) {
            cancelAnimationFrame(animId);
            animId = requestAnimationFrame(draw);
          } else {
            cancelAnimationFrame(animId);
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(parent);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseEnter = () => {
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
    };

    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseenter", handleMouseEnter);
    parent.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      ro.disconnect();
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseenter", handleMouseEnter);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden
    />
  );
}
