import { describe, it, expect, vi, beforeEach } from 'vitest';
import { agentController } from './agent.controller';

vi.mock('@repo/shared', () => ({
    AGENTS: {
        support: { name: 'Support Agent', description: 'Support' },
        router: { name: 'Router', description: 'Router' },
    },
    AGENT_CAPABILITIES: {
        support: { tools: ['tool1'], capabilities: ['cap1'] },
    },
}));

describe('Agent Controller', () => {
    let c: any;

    beforeEach(() => {
        vi.clearAllMocks();
        c = {
            req: {
                param: vi.fn(),
            },
            json: vi.fn(),
        };
    });

    describe('listAgents', () => {
        it('should return all agents', () => {
            agentController.listAgents(c);
            expect(c.json).toHaveBeenCalledWith({
                data: [
                    { name: 'Support Agent', description: 'Support' },
                    { name: 'Router', description: 'Router' },
                ],
            });
        });
    });

    describe('getCapabilities', () => {
        it('should return router capabilities', () => {
            c.req.param.mockReturnValue('router');
            agentController.getCapabilities(c);

            expect(c.json).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'Router',
                    capabilities: [
                        'Intent classification',
                        'Query routing to specialized agents',
                        'Fallback handling for ambiguous queries',
                    ],
                }),
            });
        });

        it('should return agent capabilities if found', () => {
            c.req.param.mockReturnValue('support');
            agentController.getCapabilities(c);

            expect(c.json).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'Support Agent',
                    tools: ['tool1'],
                    capabilities: ['cap1'],
                }),
            });
        });

        it('should return 404 if agent not found', () => {
            c.req.param.mockReturnValue('unknown');
            agentController.getCapabilities(c);

            expect(c.json).toHaveBeenCalledWith(
                { error: { code: 'NOT_FOUND', message: 'Agent type "unknown" not found' } },
                404
            );
        });
    });
});
