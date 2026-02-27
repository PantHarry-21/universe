import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/proposals/:slug/memories — upsert a memory by constellationId
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const { constellationId, title, caption, date, imageUrl } = body;
        const creatorToken = request.headers.get('x-creator-token');

        if (!constellationId || !title) {
            return NextResponse.json(
                { error: 'constellationId and title are required' },
                { status: 400 }
            );
        }

        const proposal = await prisma.proposal.findUnique({ where: { slug } });
        if (!proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        if (proposal.creatorToken !== creatorToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const memory = await prisma.memory.upsert({
            where: {
                proposalId_constellationId: {
                    proposalId: proposal.id,
                    constellationId,
                },
            },
            create: {
                proposalId: proposal.id,
                constellationId,
                title,
                caption: caption || null,
                date: date ? new Date(date) : null,
                imageUrl: imageUrl || null,
            },
            update: {
                title,
                caption: caption || null,
                date: date ? new Date(date) : null,
                imageUrl: imageUrl || null,
            },
        });

        return NextResponse.json(memory);
    } catch (error) {
        console.error('[POST /api/proposals/:slug/memories]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/proposals/:slug/memories?constellationId=xxx
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(request.url);
        const constellationId = searchParams.get('constellationId');
        const creatorToken = request.headers.get('x-creator-token');

        const proposal = await prisma.proposal.findUnique({ where: { slug } });
        if (!proposal) {
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        if (proposal.creatorToken !== creatorToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (constellationId) {
            await prisma.memory.deleteMany({
                where: { proposalId: proposal.id, constellationId },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/proposals/:slug/memories]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
