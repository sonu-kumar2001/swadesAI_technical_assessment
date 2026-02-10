import { createOpenAI } from '@ai-sdk/openai';

export const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Default model for agent responses (cost-effective, fast)
export const DEFAULT_MODEL = openai('gpt-4o-mini');

// Model for intent classification (same, lightweight task)
export const ROUTER_MODEL = openai('gpt-4o-mini');
