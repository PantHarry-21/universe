'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import StarField from '@/components/StarField';
import ConstellationOverlay from '@/components/ConstellationOverlay';
import MemoryModal from '@/components/MemoryModal';
import MusicToggle from '@/components/MusicToggle';
import { Memory, Proposal, Scene } from '@/lib/types';
import { CONSTELLATIONS, MEMORY_CONSTELLATIONS } from '@/lib/constellations';

interface ProposalExperienceProps {
    proposal: Proposal;
    slug: string;
    isCreator?: boolean;
}

const OPENING_LINES = [
    { text: 'Out of 8 billion people…', delay: 600 },
    { text: 'Somehow…', delay: 2400 },
    { text: 'The universe led me to you.', delay: 4200, gold: true },
];

const BUILDUP_LINES = [
    { text: 'And every star…', delay: 400 },
    { text: 'Every moment…', delay: 2000 },
    { text: 'Every path…', delay: 3600 },
    { text: 'Led here.', delay: 5200, gold: true },
];

const PROPOSAL_LINES = [
    { text: 'There is only one future I want.', delay: 600 },
    { text: 'Will you marry me?', delay: 2800, gold: true, large: true },
];

const CELEBRATION_LINES = [
    { text: 'The universe got it right.', delay: 300, gold: true, large: true },
];

export default function ProposalExperience({
    proposal,
    slug,
    isCreator = false
}: ProposalExperienceProps) {
    const [scene, setScene] = useState<Scene>('opening');
    const [memories, setMemories] = useState<Memory[]>(proposal.memories);
    const [visibleLines, setVisibleLines] = useState<number[]>([]);
    const [showAdvance, setShowAdvance] = useState(false);
    const [selectedConstellation, setSelectedConstellation] = useState<string | null>(null);
    const [burst, setBurst] = useState(false);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    const scheduleLines = useCallback((lines: { delay: number }[], onDone?: () => void) => {
        clearTimers();
        setVisibleLines([]);
        setShowAdvance(false);

        lines.forEach((_, i) => {
            const t = setTimeout(() => {
                setVisibleLines((v) => [...v, i]);
            }, lines[i].delay);
            timersRef.current.push(t);
        });

        const lastDelay = lines[lines.length - 1].delay + 1800;
        const doneTimer = setTimeout(() => {
            setShowAdvance(true);
            onDone?.();
        }, lastDelay);
        timersRef.current.push(doneTimer);
    }, []);

    // ──── Scene drivers ────
    useEffect(() => {
        if (scene === 'opening') scheduleLines(OPENING_LINES);
        if (scene === 'buildup') scheduleLines(BUILDUP_LINES);
        if (scene === 'proposal') scheduleLines(PROPOSAL_LINES);
        if (scene === 'celebration') {
            scheduleLines(CELEBRATION_LINES);
            setBurst(true);
        }
        if (scene === 'constellations') {
            setShowAdvance(true);
        }
        return clearTimers;
    }, [scene, scheduleLines]);

    const advance = () => {
        if (scene === 'opening') setScene('constellations');
        else if (scene === 'constellations') setScene('buildup');
        else if (scene === 'buildup') setScene('proposal');
    };

    const handleYes = () => {
        setScene('celebration');
        setTimeout(() => setBurst(false), 4000);
    };

    const handleReplay = () => {
        setBurst(false);
        setScene('opening');
    };

    const handleDownload = () => {
        const el = document.createElement('a');
        el.href = `data:text/plain;charset=utf-8,Our Constellation — ${proposal.title || 'The Universe Chose You'}\n\nMemories:\n${memories.map((m) => `• ${m.title}: ${m.caption || ''}`).join('\n')}`;
        el.download = 'our-constellation.txt';
        el.click();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: 'The Universe Chose You', url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const filledIds = new Set(memories.map((m) => m.constellationId));
    const activeConstellation = CONSTELLATIONS.find((c) => c.id === selectedConstellation) ?? null;
    const existingMemory = memories.find((m) => m.constellationId === selectedConstellation) ?? null;

    const handleMemorySaved = (saved: Memory) => {
        setMemories((prev) => {
            const rest = prev.filter((m) => m.constellationId !== saved.constellationId);
            return [...rest, saved];
        });
    };

    const getLinesFor = (s: Scene) => {
        if (s === 'opening') return OPENING_LINES;
        if (s === 'buildup') return BUILDUP_LINES;
        if (s === 'proposal') return PROPOSAL_LINES;
        if (s === 'celebration') return CELEBRATION_LINES;
        return [];
    };

    const currentLines = getLinesFor(scene);

    return (
        <div className="scene-container">
            {/* Background star field — always present */}
            <StarField
                particleBurst={burst}
                gatherToCenter={scene === 'buildup'}
                intensity={scene === 'proposal' || scene === 'celebration' ? 1.3 : 1}
            />

            {/* Constellation lines & hotspots */}
            {(scene === 'constellations' || scene === 'buildup' || scene === 'proposal' || scene === 'celebration') && (
                <div className="constellation-layer">
                    <ConstellationOverlay
                        constellations={MEMORY_CONSTELLATIONS}
                        filledIds={filledIds}
                        onHotspotClick={(id) => {
                            if (scene !== 'constellations') return;
                            const hasMemory = memories.some(m => m.constellationId === id);
                            if (isCreator || hasMemory) {
                                setSelectedConstellation(id);
                            }
                        }}
                        visible={scene === 'constellations'}
                    />
                </div>
            )}

            {/* Ring constellation — build-up + proposal scenes */}
            {(scene === 'buildup' || scene === 'proposal' || scene === 'celebration') && (
                <div className="constellation-layer">
                    <ConstellationOverlay
                        constellations={CONSTELLATIONS}
                        filledIds={filledIds}
                        onHotspotClick={() => { }}
                        visible={false}
                        ringOnly
                    />
                </div>
            )}

            {/* ── Scene text ── */}
            {currentLines.length > 0 && (
                <div className="cinematic-text">
                    {currentLines.map((line, i) => (
                        <p
                            key={`${scene}-${i}`}
                            className={[
                                'cinematic-line',
                                visibleLines.includes(i) ? 'visible' : '',
                                (line as { gold?: boolean }).gold ? 'gold' : '',
                                (line as { large?: boolean }).large ? 'large' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {line.text}
                        </p>
                    ))}

                    {/* Proposal buttons */}
                    {scene === 'proposal' && showAdvance && (
                        <div className="proposal-buttons" style={{ marginTop: '2rem' }}>
                            <button className="proposal-btn proposal-btn-yes" onClick={handleYes}>
                                Yes 💍
                            </button>
                            <button className="proposal-btn proposal-btn-forever" onClick={handleYes}>
                                Forever.
                            </button>
                        </div>
                    )}

                    {/* Celebration actions */}
                    {scene === 'celebration' && showAdvance && (
                        <div className="celebration-actions" style={{ marginTop: '2rem' }}>
                            <button className="celebrate-btn" onClick={handleReplay}>
                                ↺ &nbsp;Replay the journey
                            </button>
                            <button className="celebrate-btn" onClick={handleDownload}>
                                ✦ &nbsp;Download our constellation
                            </button>
                            <button className="celebrate-btn" onClick={handleShare}>
                                ✉ &nbsp;Share this moment
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Scene-specific heading for constellation scene */}
            {scene === 'constellations' && (
                <div
                    className="cinematic-text"
                    style={{ justifyContent: 'flex-start', paddingTop: '3rem', pointerEvents: 'none' }}
                >
                    <p
                        className="cinematic-line visible"
                        style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', opacity: 0.55 }}
                    >
                        Touch a star to remember.
                    </p>
                </div>
            )}

            {/* Advance button */}
            {scene !== 'proposal' && scene !== 'celebration' && (
                <button
                    className={`advance-btn${showAdvance ? ' visible' : ''}`}
                    onClick={advance}
                    aria-label="Continue to next scene"
                >
                    {scene === 'constellations' ? 'Continue the journey →' : 'Continue →'}
                </button>
            )}

            {/* Memory Modal */}
            <MemoryModal
                isOpen={!!selectedConstellation}
                onClose={() => setSelectedConstellation(null)}
                constellation={activeConstellation}
                existingMemory={existingMemory}
                slug={slug}
                onSaved={handleMemorySaved}
                isCreator={isCreator}
            />

            {/* Music Toggle */}
            <MusicToggle />
        </div>
    );
}
