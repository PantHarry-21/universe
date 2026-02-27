'use client';

import { useState, useRef, useEffect } from 'react';

interface MusicToggleProps {
    src?: string;
}

export default function MusicToggle({ src = '/ambient.mp3' }: MusicToggleProps) {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0.18;
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [src]);

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
        } else {
            audio.play().catch(() => {
                // Autoplay policy blocked
            });
        }
        setPlaying((p) => !p);
    };

    return (
        <button
            className={`music-toggle${playing ? ' playing' : ''}`}
            onClick={toggle}
            aria-label={playing ? 'Pause ambient music' : 'Play ambient music'}
            title={playing ? 'Pause music' : 'Play ambient music'}
        >
            {playing ? '♫' : '♪'}
        </button>
    );
}
