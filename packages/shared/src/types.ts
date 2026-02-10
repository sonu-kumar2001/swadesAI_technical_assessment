// ========================
// Agent Types
// ========================
export type AgentType = 'router' | 'support' | 'order' | 'billing';

export interface AgentInfo {
    type: AgentType;
    name: string;
    description: string;
}

export interface AgentCapability {
    type: AgentType;
    name: string;
    description: string;
    tools: { name: string; description: string }[];
    capabilities: string[];
}

// ========================
// Intent Classification
// ========================
export type IntentType = 'support' | 'order' | 'billing' | 'general';

export interface IntentClassification {
    intent: IntentType;
    confidence: number;
    reasoning: string;
}

// ========================
// Chat Types
// ========================
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ChatMessage {
    id: string;
    conversationId: string;
    role: MessageRole;
    content: string;
    agentType?: string | null;
    toolCalls?: unknown | null;
    metadata?: unknown | null;
    createdAt: string;
}

export interface Conversation {
    id: string;
    userId: string;
    title: string | null;
    status: string;
    lastAgentType: string | null;
    createdAt: string;
    updatedAt: string;
    messages?: ChatMessage[];
}

export interface ConversationListItem {
    id: string;
    title: string | null;
    status: string;
    lastAgentType: string | null;
    lastMessage: string | null;
    messageCount: number;
    createdAt: string;
    updatedAt: string;
}

// ========================
// API Request/Response
// ========================
export interface SendMessageRequest {
    conversationId: string | null;
    message: string;
    userId: string;
}

export interface ApiResponse<T> {
    data: T;
}

export interface ApiError {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

// ========================
// Stream Event Types
// ========================
export interface StreamMetadata {
    conversationId: string;
    messageId: string;
    agentType: string;
}

export interface ReasoningEvent {
    type: 'reasoning';
    content: string;
}
