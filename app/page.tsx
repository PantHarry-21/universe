'use client';

import { useState } from 'react';
import StarField from '@/components/StarField';

export default function HomePage() {
  const [slug, setSlug] = useState('');
  const [passcode, setPasscode] = useState('');
  const [step, setStep] = useState<'form' | 'creating' | 'done'>('form');
  const [createdSlug, setCreatedSlug] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) return;
    setStep('creating');
    setError('');

    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim(), passcode: passcode || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not create experience.');
        setStep('form');
        return;
      }

      if (data.creatorToken) {
        localStorage.setItem(`creator-token-${data.slug}`, data.creatorToken);
      }

      setCreatedSlug(data.slug);
      setStep('done');
    } catch {
      setError('Something went wrong. Please try again.');
      setStep('form');
    }
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="scene-container">
      <StarField intensity={0.8} />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100svh',
          padding: '2rem',
          gap: '0',
        }}
      >
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1
            className="cinematic-line visible gold"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              marginBottom: '1rem',
              opacity: 1,
              transform: 'none',
            }}
          >
            The Universe Chose You
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              maxWidth: '380px',
              lineHeight: 1.7,
            }}
          >
            Create a private, cinematic proposal experience — with your own
            memories written in the stars.
          </p>
        </div>

        {step === 'done' ? (
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'rgba(11,16,38,0.8)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '2rem',
              backdropFilter: 'blur(12px)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                color: 'var(--stardust-gold)',
              }}
            >
              ✦ Your universe is ready.
            </p>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  background: 'rgba(246,193,119,0.06)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  color: 'var(--soft-white)',
                  wordBreak: 'break-all',
                  paddingRight: '4rem',
                }}
              >
                {appUrl}/for/{createdSlug}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${appUrl}/for/${createdSlug}`);
                  const btn = document.getElementById('copy-btn');
                  if (btn) {
                    const original = btn.innerText;
                    btn.innerText = 'Copied!';
                    setTimeout(() => { btn.innerText = original; }, 2000);
                  }
                }}
                id="copy-btn"
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(246,193,119,0.1)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--stardust-gold)',
                  fontSize: '0.65rem',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Copy
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
              Share this link privately. Open it to start adding memories.
            </p>
            <a
              href={`/for/${createdSlug}`}
              style={{
                display: 'inline-block',
                padding: '0.875rem 2rem',
                borderRadius: '100px',
                border: '1px solid rgba(246,193,119,0.4)',
                background: 'linear-gradient(135deg, rgba(246,193,119,0.15), rgba(246,193,119,0.08))',
                color: 'var(--stardust-gold)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8rem',
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              Open the experience →
            </a>
          </div>
        ) : (
          <form
            onSubmit={handleCreate}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'rgba(11,16,38,0.8)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '2rem',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.3rem',
                fontWeight: 400,
                color: 'var(--soft-white)',
                marginBottom: '0.25rem',
              }}
            >
              Create your experience
            </h2>

            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="field-label" htmlFor="slug-input">
                Your unique link slug
              </label>
              <input
                id="slug-input"
                className="field-input"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="e.g. for-sarah"
                required
                maxLength={60}
                autoFocus
                autoComplete="off"
              />
              {slug && (
                <p
                  style={{
                    marginTop: '0.35rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {appUrl}/for/<strong style={{ color: 'var(--stardust-gold)' }}>{slug}</strong>
                </p>
              )}
            </div>

            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="field-label" htmlFor="passcode-input">
                Passcode <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <input
                id="passcode-input"
                className="field-input"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Protect with a passcode…"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p style={{ color: 'rgba(255,120,120,0.8)', fontSize: '0.8rem', fontFamily: 'var(--font-sans)' }}>
                {error}
              </p>
            )}

            <button
              className="save-btn"
              type="submit"
              disabled={step === 'creating' || !slug.trim()}
              style={{ marginTop: '0.25rem' }}
            >
              {step === 'creating' ? 'Creating…' : '✦ Create the universe'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
