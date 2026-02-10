import { hc } from 'hono/client';
import type { AppType } from '../../../api/src/index.js';

// Hono RPC client for end-to-end type safety
const API_URL = import.meta.env.VITE_API_URL || '';

export const client = hc<AppType>(API_URL);

// ========================
// Chat API Functions
// ========================

export async function sendMessage(
    userId: string,
    message: string,
    conversationId: string | null
): Promise<Response> {
    const res = await fetch(`${API_URL}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message, conversationId }),
    });

    if (!res.ok && !res.body) {
        throw new Error(`Failed to send message: ${res.status}`);
    }

    return res;
}

export async function getConversation(id: string) {
    const res = await fetch(`${API_URL}/api/chat/conversations/${id}`);
    if (!res.ok) throw new Error('Failed to fetch conversation');
    return res.json();
}

export async function listConversations(userId: string) {
    const res = await fetch(`${API_URL}/api/chat/conversations?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
}

export async function deleteConversation(id: string) {
    const res = await fetch(`${API_URL}/api/chat/conversations/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete conversation');
    return res.json();
}

// ========================
// Agent API Functions
// ========================

export async function listAgents() {
    const res = await fetch(`${API_URL}/api/agents`);
    if (!res.ok) throw new Error('Failed to fetch agents');
    return res.json();
}

export async function getAgentCapabilities(type: string) {
    const res = await fetch(`${API_URL}/api/agents/${type}/capabilities`);
    if (!res.ok) throw new Error('Failed to fetch agent capabilities');
    return res.json();
}
