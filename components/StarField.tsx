'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Star, Particle } from '@/lib/types';

interface StarFieldProps {
    particleBurst?: boolean;
    gatherToCenter?: boolean;
    intensity?: number;
}

function randomBetween(a: number, b: number) {
    return a + Math.random() * (b - a);
}

function randomColor() {
    const colors = [
        '#F8FAFC',
        '#F6C177',
        '#fffde7',
        '#e8f4fd',
        '#fff9f0',
    ];
    const rand = Math.random();
    if (rand < 0.65) return colors[0];
    if (rand < 0.80) return colors[1];
    if (rand < 0.90) return colors[2];
    if (rand < 0.95) return colors[3];
    return colors[4];
}

export default function StarField({ particleBurst = false, gatherToCenter = false, intensity = 1 }: StarFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>(0);
    const timeRef = useRef<number>(0);

    const initStars = useCallback((width: number, height: number) => {
        const count = Math.floor((width * height) / 3500 * intensity);
        starsRef.current = Array.from({ length: Math.min(count, 350) }, () => ({
            x: randomBetween(0, width),
            y: randomBetween(0, height),
            radius: randomBetween(0.3, 1.8),
            opacity: randomBetween(0.3, 1.0),
            twinkleSpeed: randomBetween(0.4, 1.6),
            twinkleOffset: randomBetween(0, Math.PI * 2),
            color: randomColor(),
        }));
    }, [intensity]);

    const spawnGoldenBurst = useCallback((width: number, height: number) => {
        const cx = width / 2;
        const cy = height / 2;
        const burst: Particle[] = [];
        for (let i = 0; i < 120; i++) {
            const angle = randomBetween(0, Math.PI * 2);
            const speed = randomBetween(1, 5);
            const gold = Math.random() > 0.3;
            burst.push({
                x: cx + randomBetween(-20, 20),
                y: cy + randomBetween(-20, 20),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - randomBetween(0.5, 2),
                life: 1,
                maxLife: randomBetween(60, 140),
                radius: randomBetween(1, 4),
                color: gold ? `hsl(${randomBetween(35, 50)}, 90%, 70%)` : '#F8FAFC',
            });
        }
        particlesRef.current = burst;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;

        const resize = () => {
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            canvas.width = width;
            canvas.height = height;
            initStars(width, height);
        };

        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const draw = (time: number) => {
            timeRef.current = time;
            ctx.clearRect(0, 0, width, height);

            // Draw stars
            starsRef.current.forEach((star) => {
                const twinkle = 0.5 + 0.5 * Math.sin(time * 0.001 * star.twinkleSpeed + star.twinkleOffset);
                const alpha = star.opacity * (0.5 + 0.5 * twinkle);

                let sx = star.x;
                let sy = star.y;

                // Gather effect: stars drift toward center
                if (gatherToCenter) {
                    const dx = width / 2 - star.x;
                    const dy = height / 2 - star.y;
                    sx = star.x + dx * 0.002 * (time * 0.001 % 30);
                    sy = star.y + dy * 0.002 * (time * 0.001 % 30);
                }

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = star.color;
                ctx.fill();

                // Soft glow for brighter stars
                if (star.radius > 1.2) {
                    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.radius * 4);
                    grad.addColorStop(0, star.color === '#F6C177' ? 'rgba(246,193,119,0.3)' : 'rgba(248,250,252,0.15)');
                    grad.addColorStop(1, 'transparent');
                    ctx.beginPath();
                    ctx.arc(sx, sy, star.radius * 4, 0, Math.PI * 2);
                    ctx.fillStyle = grad;
                    ctx.fill();
                }
                ctx.restore();
            });

            // Draw golden particles
            particlesRef.current = particlesRef.current.filter((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.04; // gentle gravity
                p.vx *= 0.99;
                p.life -= 1;

                const t = p.life / p.maxLife;
                ctx.save();
                ctx.globalAlpha = t * 0.9;
                const grad2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                grad2.addColorStop(0, p.color);
                grad2.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = grad2;
                ctx.fill();
                ctx.restore();

                return p.life > 0;
            });

            animationRef.current = requestAnimationFrame(draw);
        };

        animationRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animationRef.current);
            ro.disconnect();
        };
    }, [initStars, gatherToCenter]);

    // Trigger burst when particleBurst changes to true
    useEffect(() => {
        if (particleBurst) {
            const canvas = canvasRef.current;
            if (canvas) spawnGoldenBurst(canvas.offsetWidth, canvas.offsetHeight);
        }
    }, [particleBurst, spawnGoldenBurst]);

    return <canvas ref={canvasRef} className="star-canvas" aria-hidden="true" />;
}
