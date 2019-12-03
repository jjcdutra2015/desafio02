import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import EnrolmentController from './app/controllers/EnrolmentController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/students', StudentController.store);
routes.post('/plans', PlanController.store);
routes.post('/enrolments', EnrolmentController.store);

routes.get('/plans', PlanController.index);
routes.get('/enrolments', EnrolmentController.index);

routes.put('/students/:id', StudentController.update);
routes.put('/plans/:id', PlanController.update);
routes.put('/enrolments/:id', EnrolmentController.update);

routes.delete('/plans/:id', PlanController.delete);
routes.delete('/enrolments/:id', EnrolmentController.delete);

export default routes;
