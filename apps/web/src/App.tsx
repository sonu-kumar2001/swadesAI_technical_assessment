import React, { useState, useCallback } from 'react';
import { ConversationList } from './components/ConversationList';
import { ChatWindow } from './components/ChatWindow';
import { useChat } from './hooks/useChat';
import { useConversations } from './hooks/useConversations';

function App() {
    const [userId, setUserId] = useState('user-001');
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [activeTitle, setActiveTitle] = useState<string | null>(null);

    const {
        conversations,
        fetchConversations,
        removeConversation,
        loadConversation,
    } = useConversations(userId);

    const handleConversationCreated = useCallback(
        (newId: string) => {
            setActiveConversationId(newId);
            // Refresh the list immediately
            fetchConversations();
        },
        [fetchConversations]
    );

    const {
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
    } = useChat({
        userId,
        conversationId: activeConversationId,
        onConversationCreated: handleConversationCreated,
    });

    const handleSelectConversation = useCallback(
        async (id: string) => {
            if (id === activeConversationId) return;
            setActiveConversationId(id);
            const conv = await loadConversation(id);
            if (conv) {
                setActiveTitle(conv.title);
                loadMessages(
                    conv.messages?.map((m: any) => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                        agentType: m.agentType,
                        createdAt: m.createdAt,
                    })) || []
                );
            }
        },
        [activeConversationId, loadConversation, loadMessages]
    );

    const handleNewChat = useCallback(() => {
        setActiveConversationId(null);
        setActiveTitle(null);
        clearMessages();
    }, [clearMessages]);

    const handleDeleteConversation = useCallback(
        async (id: string) => {
            await removeConversation(id);
            if (id === activeConversationId) {
                handleNewChat();
            }
        },
        [removeConversation, activeConversationId, handleNewChat]
    );

    const handleUserChange = useCallback(
        (newUserId: string) => {
            setUserId(newUserId);
            setActiveConversationId(null);
            setActiveTitle(null);
            clearMessages();
        },
        [clearMessages]
    );

    const handleSend = useCallback(
        async (message: string) => {
            await sendMessage(message);
            // Refresh conversation list after sending
            fetchConversations();
        },
        [sendMessage, fetchConversations]
    );

    return (
        <div className="app">
            <ConversationList
                conversations={conversations}
                activeId={activeConversationId}
                onSelect={handleSelectConversation}
                onDelete={handleDeleteConversation}
                onNewChat={handleNewChat}
                userId={userId}
                onUserChange={handleUserChange}
            />
            <ChatWindow
                messages={messages}
                isLoading={isLoading}
                isStreaming={isStreaming}
                error={error}
                reasoningText={reasoningText}
                currentAgentType={currentAgentType}
                onSend={handleSend}
                onClearError={clearError}
                conversationTitle={activeTitle}
            />
        </div>
    );
}

export default App;
