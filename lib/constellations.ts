import { ConstellationConfig } from './types';

export const CONSTELLATIONS: ConstellationConfig[] = [
    {
        id: 'c1',
        label: '💫 The Night We Met',
        defaultTitle: 'The Night We Met',
        defaultCaption: 'A moment written in the stars before our hearts even knew it.',
        cx: 22,
        cy: 28,
        stars: [
            { x: 18, y: 22 },
            { x: 22, y: 18 },
            { x: 26, y: 22 },
            { x: 24, y: 28 },
            { x: 20, y: 30 },
            { x: 16, y: 26 },
        ],
    },
    {
        id: 'c2',
        label: '💕 Our First Adventure',
        defaultTitle: 'Our First Adventure',
        defaultCaption: 'We wandered together and found a love neither of us expected.',
        cx: 72,
        cy: 24,
        stars: [
            { x: 68, y: 18 },
            { x: 74, y: 16 },
            { x: 78, y: 22 },
            { x: 76, y: 28 },
            { x: 70, y: 30 },
            { x: 66, y: 25 },
        ],
    },
    {
        id: 'c3',
        label: '❤️ The Moment I Knew',
        defaultTitle: 'The Moment I Knew',
        defaultCaption: 'It was quiet. Ordinary. And then it hit me — you are the one.',
        cx: 50,
        cy: 35,
        stars: [
            { x: 47, y: 30 },
            { x: 51, y: 26 },
            { x: 55, y: 30 },
            { x: 54, y: 36 },
            { x: 50, y: 40 },
            { x: 46, y: 36 },
            { x: 43, y: 32 },
        ],
    },
    {
        id: 'c4',
        label: '🌙 Our Little Moments',
        defaultTitle: 'Our Little Moments',
        defaultCaption: 'The quiet mornings. The long drives. The everyday love.',
        cx: 28,
        cy: 62,
        stars: [
            { x: 24, y: 58 },
            { x: 28, y: 54 },
            { x: 32, y: 58 },
            { x: 34, y: 64 },
            { x: 28, y: 68 },
            { x: 22, y: 64 },
        ],
    },
    {
        id: 'c5',
        label: '✨ Your Beautiful Laugh',
        defaultTitle: 'Your Beautiful Laugh',
        defaultCaption: 'That laugh. I would cross galaxies just to hear it again.',
        cx: 74,
        cy: 65,
        stars: [
            { x: 70, y: 60 },
            { x: 76, y: 58 },
            { x: 80, y: 64 },
            { x: 78, y: 70 },
            { x: 72, y: 72 },
            { x: 68, y: 67 },
        ],
    },
    // Ring constellation used in build-up / proposal scene
    {
        id: 'ring1',
        label: '💍 Forever',
        defaultTitle: 'Forever',
        defaultCaption: 'The circle with no beginning and no end — just like our love.',
        cx: 50,
        cy: 68,
        stars: [
            { x: 50, y: 58 },
            { x: 57, y: 60 },
            { x: 61, y: 66 },
            { x: 59, y: 73 },
            { x: 52, y: 77 },
            { x: 45, y: 75 },
            { x: 41, y: 69 },
            { x: 43, y: 62 },
        ],
    },
];

export const MEMORY_CONSTELLATIONS = CONSTELLATIONS.filter(
    (c) => c.id !== 'ring1'
);
