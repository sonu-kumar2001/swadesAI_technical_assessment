import React from 'react';
import { AGENTS } from '@repo/shared';
import './AgentBadge.css';

interface AgentBadgeProps {
    type: string;
}

export const AgentBadge: React.FC<AgentBadgeProps> = ({ type }) => {
    const labels: Record<string, string> = {
        support: 'Support',
        order: 'Order',
        billing: 'Billing',
        router: 'Router',
    };

    return (
        <span className={`agent-badge ${type}`}>
            {labels[type] || type}
        </span>
    );
};
