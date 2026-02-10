import type { Context } from 'hono';
import { AGENTS, AGENT_CAPABILITIES } from '@repo/shared';
import type { AgentType } from '@repo/shared';

/**
 * Agent Controller
 * Provides agent metadata and capability information.
 */
export const agentController = {
    /**
     * GET /api/agents
     */
    listAgents(c: Context) {
        const agents = Object.values(AGENTS);
        return c.json({ data: agents });
    },

    /**
     * GET /api/agents/:type/capabilities
     */
    getCapabilities(c: Context) {
        const type = c.req.param('type') as AgentType;

        if (type === 'router') {
            return c.json({
                data: {
                    ...AGENTS.router,
                    tools: [],
                    capabilities: [
                        'Intent classification',
                        'Query routing to specialized agents',
                        'Fallback handling for ambiguous queries',
                    ],
                },
            });
        }

        const agentInfo = AGENTS[type as keyof typeof AGENTS];
        const capabilities = AGENT_CAPABILITIES[type as keyof typeof AGENT_CAPABILITIES];

        if (!agentInfo || !capabilities) {
            return c.json(
                { error: { code: 'NOT_FOUND', message: `Agent type "${type}" not found` } },
                404
            );
        }

        return c.json({
            data: {
                ...agentInfo,
                tools: capabilities.tools,
                capabilities: capabilities.capabilities,
            },
        });
    },
};
