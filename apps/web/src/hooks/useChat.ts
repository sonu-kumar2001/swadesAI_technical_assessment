import { useState, useCallback, useRef } from 'react';
import { sendMessage as apiSendMessage } from '../api/client';

export interface ChatMessageUI {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    agentType?: string;
    createdAt: string;
}

interface UseChatOptions {
    userId: string;
    conversationId: string | null;
    onConversationCreated?: (id: string) => void;
}

const THINKING_PHRASES = [
    'Thinking...',
    'Analyzing your request...',
    'Searching for answers...',
    'Looking into this...',
    'Processing your query...',
    'Consulting the knowledge base...',
    'Finding the best answer...',
];

export function useChat({ userId, conversationId, onConversationCreated }: UseChatOptions) {
    const [messages, setMessages] = useState<ChatMessageUI[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentAgentType, setCurrentAgentType] = useState<string | null>(null);
    const [reasoningText, setReasoningText] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const getRandomThinkingPhrase = () =>
        THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)];

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return;

            setError(null);

            // Add user message immediately
            const userMessage: ChatMessageUI = {
                id: `temp-user-${Date.now()}`,
                role: 'user',
                content,
                createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, userMessage]);
            setIsLoading(true);
            setReasoningText(getRandomThinkingPhrase());

            try {
                const response = await apiSendMessage(userId, content, conversationId);

                // Extract metadata from headers
                const newConversationId = response.headers.get('X-Conversation-Id');
                const agentType = response.headers.get('X-Agent-Type');
                const intentReasoning = response.headers.get('X-Intent-Reasoning');

                if (newConversationId && !conversationId && onConversationCreated) {
                    onConversationCreated(newConversationId);
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || `Error: ${response.status}`;
                    throw new Error(errorMessage);
                }

                if (agentType) setCurrentAgentType(agentType);
                if (intentReasoning) setReasoningText(intentReasoning);

                // Stream the response
                if (!response.body) throw new Error('No response body');

                setIsStreaming(true);

                // Create a placeholder for the assistant message
                const assistantId = `temp-assistant-${Date.now()}`;
                setMessages((prev) => [
                    ...prev,
                    {
                        id: assistantId,
                        role: 'assistant',
                        content: '',
                        agentType: agentType || undefined,
                        createdAt: new Date().toISOString(),
                    },
                ]);

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullText = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    // Parse the Vercel AI SDK data stream format
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (!line.trim()) continue;

                        // Text deltas start with '0:'
                        if (line.startsWith('0:')) {
                            try {
                                const textContent = JSON.parse(line.slice(2));
                                fullText += textContent;
                                setMessages((prev) =>
                                    prev.map((m) =>
                                        m.id === assistantId ? { ...m, content: fullText } : m
                                    )
                                );
                                // Clear reasoning once text starts flowing
                                setReasoningText(null);
                            } catch {
                                // Ignore parse errors on partial chunks
                            }
                        }

                        // Error blocks start with '3:'
                        if (line.startsWith('3:')) {
                            try {
                                const errorContent = JSON.parse(line.slice(2));
                                const errorMessage = typeof errorContent === 'string' ? errorContent : errorContent.message || 'Stream error';
                                throw new Error(errorMessage);
                            } catch (e) {
                                if (e instanceof Error && e.message !== 'Stream error') throw e;
                                // Ignore parse errors
                            }
                        }

                        // Tool call annotations (line starts with 'a:' or '9:')
                        if (line.startsWith('9:') || line.startsWith('a:')) {
                            try {
                                const annotation = JSON.parse(line.slice(2));
                                if (annotation.toolName) {
                                    const toolMessages: Record<string, string> = {
                                        getOrderDetails: 'Looking up order details...',
                                        checkDeliveryStatus: 'Checking delivery status...',
                                        getUserOrders: 'Fetching your orders...',
                                        getInvoiceDetails: 'Looking up invoice...',
                                        checkRefundStatus: 'Checking refund status...',
                                        getUserInvoices: 'Loading billing history...',
                                        queryConversationHistory: 'Searching conversation history...',
                                        searchFAQ: 'Searching knowledge base...',
                                    };
                                    setReasoningText(toolMessages[annotation.toolName] || 'Using tools...');
                                }
                            } catch {
                                // Ignore
                            }
                        }
                    }
                }

                setReasoningText(null);
            } catch (err) {
                console.error('[useChat] Error:', err);
                const message = err instanceof Error ? err.message : 'Failed to send message';
                setError(message);
                setReasoningText(null);

                // Add error message to chat if it's an API limit error
                if (message === 'api limit exceeded') {
                    setMessages((prev) => {
                        // Remove the placeholder assistant message if it exists
                        const filtered = prev.filter(m => !m.id.startsWith('temp-assistant-'));
                        return [
                            ...filtered,
                            {
                                id: `error-${Date.now()}`,
                                role: 'assistant',
                                content: '⚠️ api limit exceeded. Please check your OpenAI quota or wait a moment.',
                                createdAt: new Date().toISOString(),
                            },
                        ];
                    });
                }
            } finally {
                setIsLoading(false);
                setIsStreaming(false);
            }
        },
        [userId, conversationId, isLoading, onConversationCreated]
    );

    const loadMessages = useCallback((loadedMessages: ChatMessageUI[]) => {
        setMessages(loadedMessages);
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setCurrentAgentType(null);
        setError(null);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return {
        messages,
        isLoading,
        isStreaming,
        error,
        currentAgentType,
        reasoningText,
        sendMessage,
        loadMessages,
        clearMessages,
        clearError,
    };
}
