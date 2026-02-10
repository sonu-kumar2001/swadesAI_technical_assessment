import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AgentBadge } from './AgentBadge';
import type { ChatMessageUI } from '../hooks/useChat';

interface MessageBubbleProps {
    message: ChatMessageUI;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';

    const formatTime = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    return (
        <div className={`message ${message.role}`}>
            <div className="message-avatar">
                {isUser ? 'U' : 'AI'}
            </div>
            <div className="message-content">
                <div className="message-bubble">
                    {isUser ? (
                        <p>{message.content}</p>
                    ) : (
                        <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
                    )}
                </div>
                <div className="message-meta">
                    <span className="message-time">{formatTime(message.createdAt)}</span>
                    {message.agentType && <AgentBadge type={message.agentType} />}
                </div>
            </div>
        </div>
    );
};
