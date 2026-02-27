/**
 * Generate an ambient romantic music file as WAV.
 * Run: node scripts/generate-ambient.mjs
 * Output: public/ambient.mp3 (actually WAV but browsers play it)
 */
import { writeFileSync } from 'fs';

const SAMPLE_RATE = 44100;
const DURATION = 60; // 60 seconds, will loop
const NUM_SAMPLES = SAMPLE_RATE * DURATION;

// Musical notes (Hz) — A romantic chord progression in C major / A minor
const chords = [
    [261.63, 329.63, 392.00], // C major
    [220.00, 261.63, 329.63], // A minor
    [349.23, 440.00, 523.25], // F major
    [392.00, 493.88, 587.33], // G major
];

const buffer = new Float32Array(NUM_SAMPLES);

for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const chordIdx = Math.floor((t / (DURATION / chords.length))) % chords.length;
    const chord = chords[chordIdx];

    let sample = 0;

    // Pad sound — warm sine waves with gentle harmonics
    for (const freq of chord) {
        // Fundamental
        sample += 0.12 * Math.sin(2 * Math.PI * freq * t);
        // Soft octave above
        sample += 0.04 * Math.sin(2 * Math.PI * freq * 2 * t);
        // Sub-octave for warmth
        sample += 0.06 * Math.sin(2 * Math.PI * freq * 0.5 * t);
    }

    // Gentle high-frequency shimmer
    const shimmer = 0.015 * Math.sin(2 * Math.PI * 1046.5 * t) * (0.5 + 0.5 * Math.sin(t * 0.3));
    sample += shimmer;

    // Very subtle evolving texture
    sample += 0.008 * Math.sin(2 * Math.PI * 174.61 * t + Math.sin(t * 0.2) * 2);

    // Fade in/out for smooth looping
    const fadeLen = SAMPLE_RATE * 3; // 3 second fade
    let envelope = 1;
    if (i < fadeLen) envelope = i / fadeLen;
    if (i > NUM_SAMPLES - fadeLen) envelope = (NUM_SAMPLES - i) / fadeLen;

    // Gentle amplitude modulation for "breathing" feel
    const breathe = 0.85 + 0.15 * Math.sin(t * 0.4);

    buffer[i] = sample * envelope * breathe;
}

// Convert to 16-bit PCM WAV
function floatTo16BitPCM(samples) {
    const pcm = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return pcm;
}

function createWAV(samples, sampleRate) {
    const pcm = floatTo16BitPCM(samples);
    const buffer = new ArrayBuffer(44 + pcm.length * 2);
    const view = new DataView(buffer);

    function writeString(offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcm.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, pcm.length * 2, true);

    const uint8 = new Uint8Array(buffer);
    const pcmBytes = new Uint8Array(pcm.buffer);
    uint8.set(pcmBytes, 44);

    return Buffer.from(buffer);
}

const wav = createWAV(buffer, SAMPLE_RATE);
writeFileSync('public/ambient.mp3', wav);
console.log(`✅ Generated ambient music: ${(wav.length / 1024 / 1024).toFixed(1)} MB, ${DURATION}s duration`);
