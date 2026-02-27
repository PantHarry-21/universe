import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProposalClientPage from './ProposalClientPage';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const proposal = await prisma.proposal.findUnique({ where: { slug } });

    if (!proposal) {
        return { title: 'Not Found' };
    }

    return {
        title: proposal.title ? `${proposal.title} — The Universe Chose You` : 'The Universe Chose You',
        description: 'A private, cinematic proposal experience written in the stars.',
    };
}

export default async function ProposalPage({ params }: PageProps) {
    const { slug } = await params;

    const proposal = await prisma.proposal.findUnique({
        where: { slug },
        include: { memories: { orderBy: { createdAt: 'asc' } } },
    });

    if (!proposal) {
        notFound();
    }

    // Sanitize — never send passcodeHash to client
    const { passcodeHash, ...safeProposal } = proposal;

    const serializable = {
        ...safeProposal,
        hasPasscode: !!passcodeHash,
        createdAt: safeProposal.createdAt.toISOString(),
        updatedAt: safeProposal.updatedAt.toISOString(),
        memories: safeProposal.memories.map((m: any) => ({
            ...m,
            date: m.date ? m.date.toISOString() : null,
            createdAt: m.createdAt.toISOString(),
            updatedAt: m.updatedAt.toISOString(),
        })),
    };

    return <ProposalClientPage proposal={serializable} slug={slug} />;
}
