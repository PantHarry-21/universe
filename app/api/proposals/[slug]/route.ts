import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/proposals/:slug
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const proposal = await prisma.proposal.findUnique({
            where: { slug },
            include: { memories: { orderBy: { createdAt: 'asc' } } },
        });

        if (!proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        // Never return the passcode hash to public clients
        const { passcodeHash: _, ...safeProposal } = proposal;
        return NextResponse.json({
            ...safeProposal,
            hasPasscode: !!proposal.passcodeHash,
        });
    } catch (error) {
        console.error('[GET /api/proposals/:slug]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
