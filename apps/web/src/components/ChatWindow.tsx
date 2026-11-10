import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { AgentBadge } from './AgentBadge';
import './ChatWindow.css';
import type { ChatMessageUI } from '../hooks/useChat';

interface ChatWindowProps {
    messages: ChatMessageUI[];
    isLoading: boolean;
    isAwaitingResponse: boolean;
    error: string | null;
    reasoningText: string | null;
    currentAgentType: string | null;
    onSend: (message: string) => void;
    onClearError: () => void;
    conversationTitle?: string | null;
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
    isConversationLoading: boolean;
}

const SUGGESTIONS = [
    "What's the status of my order ORD-002?",
    'I need a refund for a damaged product',
    'Show me my recent invoices',
    'How do I set up my smart home hub?',
    'What is your return policy?',
    'Track my delivery',
];

export const ChatWindow: React.FC<ChatWindowProps> = ({
    messages,
    isLoading,
    isAwaitingResponse,
    error,
    reasoningText,
    currentAgentType,
    onSend,
    onClearError,
    conversationTitle,
    isSidebarOpen,
    onToggleSidebar,
    isConversationLoading,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, reasoningText]);

    return (
        <main className="chat-area">
            <div className="chat-header">
                <button
                    id="mobile-conversation-menu-toggle"
                    className={`mobile-menu-btn ${isSidebarOpen ? 'open' : ''}`}
                    onClick={onToggleSidebar}
                    aria-label={isSidebarOpen ? 'Close conversation menu' : 'Open conversation menu'}
                    aria-expanded={isSidebarOpen}
                    aria-controls="conversation-sidebar"
                >
                    <span className="mobile-menu-icon" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                    </span>
                </button>
                <div className="chat-header-copy">
                    <div className="chat-header-title">
                        {conversationTitle || 'New Conversation'}
                    </div>
                    <div className="chat-header-subtitle">
                        {currentAgentType
                            ? `Handled by ${currentAgentType.charAt(0).toUpperCase() + currentAgentType.slice(1)} Agent`
                            : 'AI-powered multi-agent support'}
                    </div>
                </div>
            </div>

            <div className="messages-container">
                {isConversationLoading ? (
                    <div className="chat-loading" role="status" aria-label="Loading conversation">
                        <span className="large-spinner" aria-hidden="true" />
                        <span>Loading conversation</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="messages-empty">
                        <div className="messages-empty-icon">💬</div>
                        <h2>How can I help you?</h2>
                        <p>
                            I'm your AI customer support assistant. Ask me about your orders,
                            billing, or any product questions.
                        </p>
                        <div className="suggestions">
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    className="suggestion-btn"
                                    onClick={() => onSend(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                    </>
                )}

                {/* Typing indicator while streaming */}
                {!isConversationLoading && isAwaitingResponse && (
                    <TypingIndicator text={reasoningText} />
                )}

                {/* Error display */}
                {error && (
                    <div className="error-banner">
                        ⚠ {error}
                        <button onClick={onClearError}>Dismiss</button>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <MessageInput onSend={onSend} isLoading={isLoading} />
        </main>
    );
};
