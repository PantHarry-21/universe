import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/proposals/:slug/verify  — verify passcode
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const { passcode } = body;

        const proposal = await prisma.proposal.findUnique({ where: { slug } });
        if (!proposal) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        if (!proposal.passcodeHash) {
            return NextResponse.json({ valid: true });
        }

        const valid = await bcrypt.compare(passcode || '', proposal.passcodeHash);
        return NextResponse.json({ valid });
    } catch (error) {
        console.error('[POST /api/proposals/:slug/verify]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
