import { Hono } from 'hono';
import { agentController } from '../controllers/agent.controller.js';

const agentRoutes = new Hono();

agentRoutes.get('/agents', (c) => agentController.listAgents(c));
agentRoutes.get('/agents/:type/capabilities', (c) => agentController.getCapabilities(c));

export { agentRoutes };
