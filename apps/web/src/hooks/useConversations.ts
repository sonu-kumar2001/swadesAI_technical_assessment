import { useState, useCallback, useEffect } from 'react';
import {
    listConversations as apiListConversations,
    deleteConversation as apiDeleteConversation,
    getConversation as apiGetConversation,
} from '../api/client';
import type { ConversationListItem } from '@repo/shared';

export function useConversations(userId: string) {
    const [conversations, setConversations] = useState<ConversationListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchConversations = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const res = await apiListConversations(userId);
            setConversations(res.data || []);
        } catch (err) {
            console.error('[useConversations] Fetch failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const removeConversation = useCallback(
        async (id: string) => {
            try {
                await apiDeleteConversation(id);
                setConversations((prev) => prev.filter((c) => c.id !== id));
            } catch (err) {
                console.error('[useConversations] Delete failed:', err);
            }
        },
        []
    );

    const loadConversation = useCallback(async (id: string) => {
        try {
            const res = await apiGetConversation(id);
            return res.data;
        } catch (err) {
            console.error('[useConversations] Load failed:', err);
            return null;
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    return {
        conversations,
        isLoading,
        fetchConversations,
        removeConversation,
        loadConversation,
    };
}
