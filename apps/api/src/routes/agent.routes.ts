import { Hono } from 'hono';
import { agentController } from '../controllers/agent.controller.js';

const agentRoutes = new Hono();

agentRoutes.get('/', (c) => agentController.listAgents(c));
agentRoutes.get('/:type/capabilities', (c) => agentController.getCapabilities(c));

export { agentRoutes };
