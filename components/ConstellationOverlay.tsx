'use client';

import { useEffect, useRef } from 'react';
import { ConstellationConfig } from '@/lib/types';

interface ConstellationOverlayProps {
    constellations: ConstellationConfig[];
    filledIds: Set<string>;
    onHotspotClick: (id: string) => void;
    visible: boolean;
    ringOnly?: boolean;
}

export default function ConstellationOverlay({
    constellations,
    filledIds,
    onHotspotClick,
    visible,
    ringOnly = false,
}: ConstellationOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const draw = (time: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const w = canvas.width;
            const h = canvas.height;

            constellations.forEach((c) => {
                if (ringOnly && c.id !== 'ring1') return;
                if (!ringOnly && c.id === 'ring1') return;

                const isFilled = filledIds.has(c.id);
                const isRing = c.id === 'ring1';

                const pixelStars = c.stars.map((s) => ({
                    px: (s.x / 100) * w,
                    py: (s.y / 100) * h,
                }));

                // Draw connecting lines
                ctx.save();
                ctx.beginPath();
                pixelStars.forEach((s, i) => {
                    if (i === 0) ctx.moveTo(s.px, s.py);
                    else ctx.lineTo(s.px, s.py);
                });
                if (isRing) ctx.closePath();

                const lineAlpha = isRing
                    ? 0.35 + 0.15 * Math.sin(time * 0.002)
                    : isFilled
                        ? 0.4
                        : 0.15;

                ctx.strokeStyle = isFilled || isRing
                    ? `rgba(246,193,119,${lineAlpha})`
                    : `rgba(248,250,252,${lineAlpha})`;
                ctx.lineWidth = isRing ? 1.2 : 0.8;
                ctx.stroke();
                ctx.restore();

                // Draw stars of the constellation
                pixelStars.forEach((s) => {
                    const pulse = 0.7 + 0.3 * Math.sin(time * 0.0015 + s.px);
                    const radius = isRing ? 2.5 : isFilled ? 2.2 : 1.5;

                    // Glow
                    ctx.save();
                    const grad = ctx.createRadialGradient(s.px, s.py, 0, s.px, s.py, radius * 6);
                    grad.addColorStop(0, isFilled || isRing ? 'rgba(246,193,119,0.4)' : 'rgba(248,250,252,0.15)');
                    grad.addColorStop(1, 'transparent');
                    ctx.beginPath();
                    ctx.arc(s.px, s.py, radius * 6, 0, Math.PI * 2);
                    ctx.fillStyle = grad;
                    ctx.fill();
                    ctx.restore();

                    // Star core
                    ctx.save();
                    ctx.globalAlpha = pulse;
                    ctx.beginPath();
                    ctx.arc(s.px, s.py, radius, 0, Math.PI * 2);
                    ctx.fillStyle = isFilled || isRing ? '#F6C177' : '#F8FAFC';
                    ctx.fill();
                    ctx.restore();
                });
            });

            animRef.current = requestAnimationFrame(draw);
        };

        animRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animRef.current);
            ro.disconnect();
        };
    }, [constellations, filledIds, ringOnly]);

    return (
        <>
            {/* Canvas draws the lines and star dots */}
            <canvas
                ref={canvasRef}
                className="star-canvas"
                style={{ zIndex: 4 }}
                aria-hidden="true"
            />

            {/* Clickable hotspots */}
            {visible &&
                constellations
                    .filter((c) => (ringOnly ? c.id === 'ring1' : c.id !== 'ring1'))
                    .map((c) => {
                        const isFilled = filledIds.has(c.id);
                        return (
                            <div
                                key={c.id}
                                className={`constellation-hotspot${isFilled ? ' filled' : ''}`}
                                style={{ left: `${c.cx}%`, top: `${c.cy}%` }}
                                onClick={() => onHotspotClick(c.id)}
                                title={c.label}
                                role="button"
                                aria-label={`Open memory: ${c.label}`}
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && onHotspotClick(c.id)}
                            >
                                <div className="constellation-hotspot-inner">
                                    <div className="hotspot-dot" />
                                </div>
                                <span className="constellation-label">{c.label}</span>
                            </div>
                        );
                    })}
        </>
    );
}
