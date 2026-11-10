import { useState, useCallback, useEffect, useRef } from 'react';
import {
    listConversations as apiListConversations,
    deleteConversation as apiDeleteConversation,
    getConversation as apiGetConversation,
} from '../api/client';
import type { ConversationListItem } from '@repo/shared';

export function useConversations(userId: string) {
    const [conversations, setConversations] = useState<ConversationListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingIds, setDeletingIds] = useState<string[]>([]);
    const fetchRequestId = useRef(0);

    const fetchConversations = useCallback(async () => {
        if (!userId) return;
        const requestId = ++fetchRequestId.current;
        setIsLoading(true);
        try {
            const res = await apiListConversations(userId);
            if (requestId === fetchRequestId.current) setConversations(res.data || []);
        } catch (err) {
            console.error('[useConversations] Fetch failed:', err);
        } finally {
            if (requestId === fetchRequestId.current) setIsLoading(false);
        }
    }, [userId]);

    const removeConversation = useCallback(
        async (id: string) => {
            if (deletingIds.includes(id)) return false;
            setDeletingIds((prev) => [...prev, id]);
            try {
                await apiDeleteConversation(id);
                setConversations((prev) => prev.filter((c) => c.id !== id));
                return true;
            } catch (err) {
                console.error('[useConversations] Delete failed:', err);
                return false;
            } finally {
                setDeletingIds((prev) => prev.filter((deletingId) => deletingId !== id));
            }
        },
        [deletingIds]
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
        deletingIds,
        fetchConversations,
        removeConversation,
        loadConversation,
    };
}
