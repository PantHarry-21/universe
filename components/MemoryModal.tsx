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
    const [uploading, setUploading] = useState(false);
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
        pendingFileRef.current = file;
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        if (!constellation) return;
        setSaving(true);
        setError('');

        try {
            let finalImageUrl = imageUrl;

            // Upload new image if selected
            if (pendingFileRef.current) {
                setUploading(true);
                const fd = new FormData();
                fd.append('file', pendingFileRef.current);
                fd.append('slug', slug);
                const upRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: fd,
                    headers: {
                        'x-creator-token': localStorage.getItem(`creator-token-${slug}`) || ''
                    }
                });
                setUploading(false);

                if (!upRes.ok) {
                    const errorData = await upRes.json().catch(() => ({}));
                    throw new Error(errorData.error || errorData.details || 'Image upload failed. Please try again.');
                }
                const upData = await upRes.json();
                finalImageUrl = upData.imageUrl;
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
                            disabled={saving || uploading || !title.trim()}
                        >
                            {uploading ? 'Uploading photo…' : saving ? 'Saving…' : '✦ Save this memory'}
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
