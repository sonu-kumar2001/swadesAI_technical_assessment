import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessageUI } from '../hooks/useChat';

interface ChatWindowProps {
    messages: ChatMessageUI[];
    isLoading: boolean;
    isStreaming: boolean;
    error: string | null;
    reasoningText: string | null;
    currentAgentType: string | null;
    onSend: (message: string) => void;
    onClearError: () => void;
    conversationTitle?: string | null;
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
    isStreaming,
    error,
    reasoningText,
    currentAgentType,
    onSend,
    onClearError,
    conversationTitle,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, reasoningText]);

    return (
        <main className="chat-area">
            <div className="chat-header">
                <div>
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
                {messages.length === 0 ? (
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

                {/* Reasoning display while agent thinks / calls tools */}
                {reasoningText && !isStreaming && (
                    <div className="reasoning-display">
                        <span className="reasoning-icon">⚙</span>
                        <span className="reasoning-text">{reasoningText}</span>
                    </div>
                )}

                {/* Typing indicator while streaming */}
                {isStreaming && !reasoningText && (
                    <TypingIndicator />
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
