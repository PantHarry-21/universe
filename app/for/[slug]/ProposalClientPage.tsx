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
    const [mounted, setMounted] = useState(false);
    const [unlocked, setUnlocked] = useState(!proposal.hasPasscode);
    const [isCreator, setIsCreator] = useState(false);

    // Only render after mount to avoid hydration mismatches
    // (localStorage, window, etc. don't exist on server)
    useEffect(() => {
        setMounted(true);
        const token = localStorage.getItem(`creator-token-${slug}`);
        if (token && proposal.creatorToken === token) {
            setIsCreator(true);
        }
    }, [slug, proposal.creatorToken]);

    // Show a loading state until client has mounted
    if (!mounted) {
        return (
            <div className="scene-container">
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--midnight, #050510)',
                }}>
                    <div className="star-spinner" />
                </div>
            </div>
        );
    }

    if (!unlocked) {
        return <PasscodeScreen slug={slug} onUnlocked={() => setUnlocked(true)} />;
    }

    return <ProposalExperience proposal={proposal} slug={slug} isCreator={isCreator} />;
}
