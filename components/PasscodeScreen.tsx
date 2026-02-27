'use client';

import { useState } from 'react';
import StarField from '@/components/StarField';

interface PasscodeScreenProps {
    slug: string;
    onUnlocked: () => void;
}

export default function PasscodeScreen({ slug, onUnlocked }: PasscodeScreenProps) {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setChecking(true);
        setError('');

        try {
            const res = await fetch(`/api/proposals/${slug}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode: value }),
            });
            const data = await res.json();
            if (data.valid) {
                onUnlocked();
            } else {
                setError('Incorrect passcode. Try again.');
                setValue('');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="scene-container">
            <StarField intensity={0.7} />
            <div className="passcode-screen" style={{ background: 'transparent' }}>
                <p className="passcode-title">This moment is private.</p>
                <p className="passcode-subtitle">Enter your passcode to continue.</p>
                <form className="passcode-form" onSubmit={handleSubmit}>
                    <input
                        className="passcode-input"
                        type="password"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="· · · · · ·"
                        autoFocus
                        autoComplete="current-password"
                        aria-label="Passcode"
                    />
                    {error && <p className="passcode-error">{error}</p>}
                    <button
                        className="passcode-submit"
                        type="submit"
                        disabled={checking || !value}
                    >
                        {checking ? 'Checking…' : 'Enter ✦'}
                    </button>
                </form>
            </div>
        </div>
    );
}
