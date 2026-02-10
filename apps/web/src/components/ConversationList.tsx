import React from 'react';
import type { ConversationListItem } from '@repo/shared';
import { AgentBadge } from './AgentBadge';

interface ConversationListProps {
    conversations: ConversationListItem[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onNewChat: () => void;
    userId: string;
    onUserChange: (id: string) => void;
}

const DEMO_USERS = [
    { id: 'user-001', name: 'Alice Johnson' },
    { id: 'user-002', name: 'Bob Smith' },
    { id: 'user-003', name: 'Carol Davis' },
];

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    activeId,
    onSelect,
    onDelete,
    onNewChat,
    userId,
    onUserChange,
}) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1>AI Support</h1>
                <p>Multi-Agent Customer Support</p>
                <button className="new-chat-btn" onClick={onNewChat}>
                    ＋ New Conversation
                </button>
            </div>

            <div className="conversation-list">
                {conversations.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        No conversations yet
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`conversation-item ${conv.id === activeId ? 'active' : ''}`}
                            onClick={() => onSelect(conv.id)}
                        >
                            <div className="conversation-item-content">
                                <div className="conversation-item-title">
                                    {conv.title || 'Untitled'}
                                </div>
                                <div className="conversation-item-preview">
                                    {conv.lastMessage
                                        ? conv.lastMessage.slice(0, 60) + (conv.lastMessage.length > 60 ? '...' : '')
                                        : 'No messages'}
                                </div>
                                <div className="conversation-item-meta">
                                    {conv.lastAgentType && (
                                        <AgentBadge type={conv.lastAgentType} />
                                    )}
                                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                        {conv.messageCount} msgs
                                    </span>
                                </div>
                            </div>
                            <button
                                className="conversation-delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(conv.id);
                                }}
                                title="Delete conversation"
                            >
                                ✕
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="user-selector">
                <label>Current User</label>
                <select
                    value={userId}
                    onChange={(e) => onUserChange(e.target.value)}
                >
                    {DEMO_USERS.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name}
                        </option>
                    ))}
                </select>
            </div>
        </aside>
    );
};
