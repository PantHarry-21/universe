'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface MusicToggleProps {
    src?: string;
}

export default function MusicToggle({ src = '/ambient.mp3' }: MusicToggleProps) {
    const [playing, setPlaying] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0.15;
        audio.preload = 'auto';
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [src]);

    const startPlaying = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || playing) return;
        audio.play().then(() => {
            setPlaying(true);
            setHasInteracted(true);
        }).catch(() => {
            // Autoplay blocked — user needs to click the button
        });
    }, [playing]);

    // Listen for global 'start-music' events (e.g., passcode unlock, scene change)
    useEffect(() => {
        const handleStart = () => startPlaying();
        window.addEventListener('start-music', handleStart);
        return () => window.removeEventListener('start-music', handleStart);
    }, [startPlaying]);

    // Try to auto-start on first page interaction
    useEffect(() => {
        if (hasInteracted) return;
        const tryStart = () => {
            startPlaying();
            document.removeEventListener('click', tryStart);
            document.removeEventListener('touchstart', tryStart);
        };
        document.addEventListener('click', tryStart, { once: true });
        document.addEventListener('touchstart', tryStart, { once: true });
        return () => {
            document.removeEventListener('click', tryStart);
            document.removeEventListener('touchstart', tryStart);
        };
    }, [hasInteracted, startPlaying]);

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            audio.play().then(() => {
                setPlaying(true);
                setHasInteracted(true);
            }).catch(() => { });
        }
    };

    return (
        <button
            className={`music-toggle${playing ? ' playing' : ''}`}
            onClick={toggle}
            aria-label={playing ? 'Pause music' : 'Play music'}
            title={playing ? 'Pause music' : 'Play romantic music'}
        >
            {playing ? '♫' : '♪'}
        </button>
    );
}
