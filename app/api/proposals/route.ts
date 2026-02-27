import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/proposals — create a new proposal
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { slug, title, passcode } = body;

        if (!slug || typeof slug !== 'string') {
            return NextResponse.json({ error: 'slug is required' }, { status: 400 });
        }

        const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

        const existing = await prisma.proposal.findUnique({ where: { slug: normalized } });
        if (existing) {
            return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
        }

        const passcodeHash = passcode ? await bcrypt.hash(passcode, 12) : null;

        const proposal = await prisma.proposal.create({
            data: { slug: normalized, title: title || null, passcodeHash },
        });

        const { passcodeHash: _, ...safe } = proposal;
        return NextResponse.json({ ...safe, hasPasscode: !!passcodeHash }, { status: 201 });
    } catch (error) {
        console.error('[POST /api/proposals]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
