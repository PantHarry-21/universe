export interface Memory {
    id: string;
    proposalId: string;
    constellationId: string;
    title: string;
    caption?: string | null;
    date?: string | null;
    imageUrl?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Proposal {
    id: string;
    slug: string;
    title?: string | null;
    passcodeHash?: string | null;
    creatorToken?: string | null;
    createdAt: string;
    updatedAt: string;
    memories: Memory[];
}

export interface ConstellationConfig {
    id: string;
    label: string;
    defaultTitle: string;
    defaultCaption: string;
    // Star positions as percentages 0-100 relative to the full sky canvas
    stars: { x: number; y: number }[];
    // Center hotspot for click detection
    cx: number;
    cy: number;
}

export interface Star {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    twinkleSpeed: number;
    twinkleOffset: number;
    color: string;
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    radius: number;
    color: string;
}

export type Scene =
    | 'opening'
    | 'constellations'
    | 'buildup'
    | 'proposal'
    | 'celebration';
