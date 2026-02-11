import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as contextService from './context.service';
import { generateText } from 'ai';
import { estimateMessagesTokens } from '../lib/token-counter';

vi.mock('ai', () => ({
    generateText: vi.fn(),
}));

vi.mock('../lib/token-counter', () => ({
    estimateMessagesTokens: vi.fn(),
}));

// Mock TOKEN_CONFIG
vi.mock('@repo/shared', () => ({
    TOKEN_CONFIG: {
        MAX_CONTEXT_TOKENS: 2000,
    },
}));

describe('Context Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('prepareContext', () => {
        it('should return core messages directly if under token limit', async () => {
            const messages = [{ role: 'user', content: 'Hello' }];
            vi.mocked(estimateMessagesTokens).mockReturnValue(100);

            const result = await contextService.prepareContext(messages, null);
            expect(result).toEqual([{ role: 'user', content: 'Hello' }]);
        });

        it('should compact messages if token limit exceeded', async () => {
            // Create enough messages to trigger compaction logic effectively
            const messages = [
                { role: 'user', content: 'Old 1' },
                { role: 'assistant', content: 'Old 2' },
                { role: 'user', content: 'Recent 1' },
                { role: 'assistant', content: 'Recent 2' },
                { role: 'user', content: 'Recent 3' },
            ];

            vi.mocked(estimateMessagesTokens).mockReturnValue(5000); // Exceeds limit
            vi.mocked(generateText).mockResolvedValue({ text: 'Summarized content' } as any);

            const result = await contextService.prepareContext(messages, null);

            expect(generateText).toHaveBeenCalled();
            // The result should start with system summary
            expect(result[0]).toEqual({
                role: 'system',
                content: 'Previous conversation summary: Summarized content'
            });
            // And should contain the recent messages (last 4 max)
            expect(result.length).toBeGreaterThan(1);
        });
    });

    describe('generateTitle', () => {
        it('should generate a title', async () => {
            vi.mocked(generateText).mockResolvedValue({ text: 'New Title' } as any);
            const title = await contextService.generateTitle('Hello world');
            expect(title).toBe('New Title');
        });

        it('should return default title on error', async () => {
            vi.mocked(generateText).mockRejectedValue(new Error('AI Error'));
            const title = await contextService.generateTitle('Hello world');
            expect(title).toBe('New Conversation');
        });
    });
});
