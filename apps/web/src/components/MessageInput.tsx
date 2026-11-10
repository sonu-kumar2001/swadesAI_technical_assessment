import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';

const MAX_TEXTAREA_HEIGHT = 150;

interface MessageInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        onSend(trimmed);
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.overflowY = 'hidden';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto';
        const borderHeight = textarea.offsetHeight - textarea.clientHeight;
        const contentHeight = textarea.scrollHeight + borderHeight;

        textarea.style.height = `${Math.min(contentHeight, MAX_TEXTAREA_HEIGHT)}px`;
        textarea.style.overflowY = contentHeight > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden';
    }, [input]);

    return (
        <div className="message-input-container">
            <div className="message-input-wrapper">
                <textarea
                    ref={textareaRef}
                    className="message-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message…"
                    disabled={isLoading}
                    rows={1}
                />
                <button
                    className="send-btn"
                    onClick={handleSubmit}
                    disabled={!input.trim() || isLoading}
                    title="Send message"
                    aria-label="Send message"
                >
                    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <path d="M10 15.5V4.75m0 0L5.75 9m4.25-4.25L14.25 9" />
                    </svg>
                </button>
            </div>
            <p className="input-hint">
                Press Enter to send · Shift+Enter for new line
            </p>
        </div>
    );
};
