import StarField from '@/components/StarField';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="scene-container">
            <StarField intensity={0.6} />
            <div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100svh',
                    gap: '1.5rem',
                    textAlign: 'center',
                    padding: '2rem',
                }}
            >
                <h1
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: 300,
                        color: 'var(--soft-white)',
                        letterSpacing: '0.04em',
                    }}
                >
                    This star doesn&apos;t exist yet.
                </h1>
                <p
                    style={{
                        fontFamily: 'var(--font-sans)',
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        letterSpacing: '0.06em',
                    }}
                >
                    The universe you&apos;re looking for hasn&apos;t been created.
                </p>
                <Link
                    href="/"
                    style={{
                        marginTop: '1rem',
                        padding: '0.875rem 2rem',
                        borderRadius: '100px',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.8rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                    }}
                >
                    Create one →
                </Link>
            </div>
        </div>
    );
}
