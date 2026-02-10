import React from 'react';

interface TypingIndicatorProps {
    text?: string | null;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ text }) => {
    return (
        <div className="typing-indicator">
            <div className="message-avatar" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
                AI
            </div>
            <div className="typing-bubble">
                <div className="typing-dots">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                </div>
                {text && <span className="typing-text">{text}</span>}
            </div>
        </div>
    );
};
