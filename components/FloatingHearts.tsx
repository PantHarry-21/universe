'use client';

import { useEffect, useRef } from 'react';

interface FloatingHeartsProps {
    intensity?: number;
    scene?: string;
}

interface Heart {
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    wobble: number;
    wobbleSpeed: number;
    rotation: number;
    rotationSpeed: number;
    color: string;
}

const HEART_COLORS = [
    'rgba(255, 107, 129, 0.6)',
    'rgba(255, 154, 158, 0.5)',
    'rgba(255, 182, 193, 0.45)',
    'rgba(250, 112, 154, 0.5)',
    'rgba(255, 77, 109, 0.4)',
    'rgba(255, 200, 221, 0.35)',
];

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, rotation: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    const s = size;
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.3, -s, s * 0.1, 0, s);
    ctx.bezierCurveTo(s, s * 0.1, s * 0.5, -s * 0.3, 0, s * 0.3);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

export default function FloatingHearts({ intensity = 1, scene = '' }: FloatingHeartsProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const heartsRef = useRef<Heart[]>([]);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w = canvas.offsetWidth;
        let h = canvas.offsetHeight;

        const resize = () => {
            w = canvas.offsetWidth;
            h = canvas.offsetHeight;
            canvas.width = w;
            canvas.height = h;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        // Create hearts
        const count = Math.floor(12 * intensity);
        heartsRef.current = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: h + Math.random() * h,
            size: 4 + Math.random() * 10,
            speed: 0.3 + Math.random() * 0.6,
            opacity: 0.15 + Math.random() * 0.4,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.005 + Math.random() * 0.015,
            rotation: (Math.random() - 0.5) * 0.6,
            rotationSpeed: (Math.random() - 0.5) * 0.003,
            color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
        }));

        const draw = () => {
            ctx.clearRect(0, 0, w, h);

            heartsRef.current.forEach((heart) => {
                heart.y -= heart.speed;
                heart.wobble += heart.wobbleSpeed;
                heart.rotation += heart.rotationSpeed;
                const wobbleX = Math.sin(heart.wobble) * 20;

                ctx.globalAlpha = heart.opacity;
                drawHeart(ctx, heart.x + wobbleX, heart.y, heart.size, heart.color, heart.rotation);
                ctx.globalAlpha = 1;

                // Reset when off screen
                if (heart.y < -30) {
                    heart.y = h + 20;
                    heart.x = Math.random() * w;
                    heart.size = 4 + Math.random() * 10;
                    heart.speed = 0.3 + Math.random() * 0.6;
                }
            });

            animRef.current = requestAnimationFrame(draw);
        };

        animRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animRef.current);
            ro.disconnect();
        };
    }, [intensity, scene]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 2,
            }}
            aria-hidden="true"
        />
    );
}
