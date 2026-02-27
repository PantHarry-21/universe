'use client';

import { useState, useRef, useEffect } from 'react';
import { Memory, ConstellationConfig } from '@/lib/types';

interface MemoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    constellation: ConstellationConfig | null;
    existingMemory: Memory | null;
    slug: string;
    onSaved: (memory: Memory) => void;
    onDeleted: (constellationId: string) => void;
    isCreator?: boolean;
}

export default function MemoryModal({
    isOpen,
    onClose,
    constellation,
    existingMemory,
    slug,
    onSaved,
    onDeleted,
    isCreator = false,
}: MemoryModalProps) {
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [date, setDate] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);
    const pendingFileRef = useRef<File | null>(null);

    useEffect(() => {
        if (isOpen && constellation) {
            setTitle(existingMemory?.title ?? constellation.defaultTitle);
            setCaption(existingMemory?.caption ?? constellation.defaultCaption);
            setDate(existingMemory?.date ? existingMemory.date.split('T')[0] : '');
            setImageUrl(existingMemory?.imageUrl ?? null);
            setImagePreview(existingMemory?.imageUrl ?? null);
            setError('');
            pendingFileRef.current = null;
        }
    }, [isOpen, constellation, existingMemory]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Perform fast client-side compression to avoid storage timeouts
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 800; // Resize to max 800px width/height

                if (width > height && width > MAX_SIZE) {
                    height = Math.round((height * MAX_SIZE) / width);
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width = Math.round((width * MAX_SIZE) / height);
                    height = MAX_SIZE;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                // Compress to fast, lightweight JPEG base64 string
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                setImagePreview(compressedBase64);
                pendingFileRef.current = file; // Still track that a file was added
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!constellation) return;
        setSaving(true);
        setError('');

        try {
            let finalImageUrl = imageUrl;

            // Since we compressed it to base64, we don't need the Supabase upload endpoint anymore!
            // We just save the base64 string directly to Postgres which guarantees immediate success.
            if (pendingFileRef.current && imagePreview) {
                finalImageUrl = imagePreview; // The base64 string
            }

            // Upsert memory
            const res = await fetch(`/api/proposals/${slug}/memories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-creator-token': localStorage.getItem(`creator-token-${slug}`) || ''
                },
                body: JSON.stringify({
                    constellationId: constellation.id,
                    title,
                    caption,
                    date: date || null,
                    imageUrl: finalImageUrl,
                }),
            });

            if (!res.ok) {
                throw new Error('Could not save memory. Please try again.');
            }

            const saved: Memory = await res.json();
            onSaved(saved);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!constellation || !existingMemory) return;
        if (!confirm('Are you sure you want to remove this memory from the stars?')) return;

        setSaving(true);
        setError('');

        try {
            const res = await fetch(`/api/proposals/${slug}/memories?constellationId=${constellation.id}`, {
                method: 'DELETE',
                headers: {
                    'x-creator-token': localStorage.getItem(`creator-token-${slug}`) || ''
                }
            });

            if (!res.ok) {
                throw new Error('Could not delete memory. Please try again.');
            }

            onDeleted(constellation.id);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
            setSaving(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen || !constellation) return null;

    return (
        <div
            className="modal-overlay open"
            onClick={handleOverlayClick}
            aria-modal="true"
            role="dialog"
            aria-label={`Edit memory: ${constellation.label}`}
        >
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {constellation?.label ?? 'Memory'}
                    </h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                {/* Image Upload */}
                <div
                    className={`image-upload-zone${imagePreview ? ' has-image' : ''}`}
                    onClick={() => isCreator && fileRef.current?.click()}
                    role="button"
                    aria-label={isCreator ? "Upload memory photo" : "Memory photo"}
                    tabIndex={isCreator ? 0 : -1}
                    onKeyDown={(e) => isCreator && e.key === 'Enter' && fileRef.current?.click()}
                    style={{ cursor: isCreator ? 'pointer' : 'default' }}
                >
                    {imagePreview ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imagePreview} alt="Memory" />
                            {isCreator && (
                                <div className="upload-overlay">
                                    <span className="upload-icon">📷</span>
                                    <span className="upload-text">Change photo</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <span className="upload-icon">✦</span>
                            <span className="upload-text">{isCreator ? 'Add a photo' : 'No photo yet'}</span>
                            {isCreator && (
                                <span style={{ fontSize: '0.65rem', color: 'rgba(248,250,252,0.25)', letterSpacing: '0.08em' }}>
                                    JPG, PNG, WEBP
                                </span>
                            )}
                        </>
                    )}
                    {isCreator && (
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            aria-label="Choose memory photo"
                        />
                    )}
                </div>

                {/* Title */}
                <div className="field-group">
                    <label className="field-label" htmlFor="memory-title">Title</label>
                    <input
                        id="memory-title"
                        className="field-input"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={isCreator ? "A title for this memory…" : ""}
                        maxLength={80}
                        readOnly={!isCreator}
                    />
                </div>

                {/* Caption */}
                <div className="field-group">
                    <label className="field-label" htmlFor="memory-caption">Caption</label>
                    <textarea
                        id="memory-caption"
                        className="field-textarea"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={isCreator ? "A few words about this moment…" : "No description provided."}
                        maxLength={240}
                        rows={3}
                        readOnly={!isCreator}
                    />
                </div>

                {/* Date */}
                <div className="field-group">
                    <label className="field-label" htmlFor="memory-date">Date <span style={{ opacity: 0.4 }}>(optional)</span></label>
                    <input
                        id="memory-date"
                        className="field-input"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        readOnly={!isCreator}
                    />
                </div>

                {error && (
                    <p style={{ color: 'rgba(255,120,120,0.8)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                        {error}
                    </p>
                )}

                {isCreator && (
                    <>
                        <button
                            className="save-btn"
                            onClick={handleSave}
                            disabled={saving || !title.trim()}
                        >
                            {saving ? 'Saving…' : '✦ Save this memory'}
                        </button>

                        {existingMemory && !saving && (
                            <button
                                onClick={handleDelete}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255,120,120,0.5)',
                                    fontSize: '0.7rem',
                                    marginTop: '1.5rem',
                                    cursor: 'pointer',
                                    fontFamily: 'var(--font-sans)',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Remove from the stars
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
