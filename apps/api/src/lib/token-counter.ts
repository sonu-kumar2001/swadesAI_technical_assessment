/**
 * Simple token estimation.
 * GPT tokenizers average ~4 chars per token for English text.
 * For production, use tiktoken or gpt-tokenizer for exact counts.
 */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

export function estimateMessagesTokens(
    messages: { role: string; content: string }[]
): number {
    let total = 0;
    for (const msg of messages) {
        // ~4 tokens overhead per message for role, delimiters
        total += 4 + estimateTokens(msg.content);
    }
    return total;
}
