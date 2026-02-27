'use client';

import { useState, useEffect } from 'react';
import ProposalExperience from '@/components/ProposalExperience';
import PasscodeScreen from '@/components/PasscodeScreen';
import { Proposal } from '@/lib/types';

interface ProposalClientPageProps {
    proposal: Proposal & { hasPasscode: boolean };
    slug: string;
}

export default function ProposalClientPage({ proposal, slug }: ProposalClientPageProps) {
    const [unlocked, setUnlocked] = useState(!proposal.hasPasscode);

    // Check if current user is the creator
    const [isCreator, setIsCreator] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem(`creator-token-${slug}`);
        if (token && proposal.creatorToken === token) {
            setIsCreator(true);
        }
    }, [slug, proposal.creatorToken]);

    if (!unlocked) {
        return <PasscodeScreen slug={slug} onUnlocked={() => setUnlocked(true)} />;
    }

    return <ProposalExperience proposal={proposal} slug={slug} isCreator={isCreator} />;
}
