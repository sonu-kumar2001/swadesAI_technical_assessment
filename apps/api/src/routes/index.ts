import { Hono } from 'hono';
import { chatRoutes } from './chat.routes.js';
import { agentRoutes } from './agent.routes.js';
import { healthRoutes } from './health.routes.js';

export const Routes = new Hono();

Routes.route('/', chatRoutes);
Routes.route('/', agentRoutes);
Routes.route('/', healthRoutes);
