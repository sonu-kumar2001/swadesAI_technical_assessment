import { describe, it, expect, vi } from 'vitest';
import { agentRoutes } from './agent.routes';
import { agentController } from '../controllers/agent.controller';

vi.mock('../controllers/agent.controller', () => ({
    agentController: {
        listAgents: vi.fn(),
        getCapabilities: vi.fn(),
    },
}));

describe('Agent Routes', () => {
    it('GET / should call listAgents controller', async () => {
        vi.mocked(agentController.listAgents).mockResolvedValue(new Response('ok') as any);
        const res = await agentRoutes.request('/');
        expect(agentController.listAgents).toHaveBeenCalled();
    });

    it('GET /:type/capabilities should call getCapabilities controller', async () => {
        vi.mocked(agentController.getCapabilities).mockResolvedValue(new Response('ok') as any);
        const res = await agentRoutes.request('/support/capabilities');
        expect(agentController.getCapabilities).toHaveBeenCalled();
    });
});
