import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import EnrolmentController from './app/controllers/EnrolmentController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrdersController from './app/controllers/HelpOrdersController';
import GymController from './app/controllers/GymController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/students', StudentController.store);
routes.post('/students/:id/checkins', CheckinController.store);
routes.post('/students/:id/help-orders', HelpOrdersController.store);
routes.post('/plans', PlanController.store);
routes.post('/enrolments', EnrolmentController.store);
routes.post('/help-orders/:id/answer', GymController.store);

routes.get('/plans', PlanController.index);
routes.get('/enrolments', EnrolmentController.index);
routes.get('/students/:id/checkins', CheckinController.index);
routes.get('/students/:id/help-orders', HelpOrdersController.index);
routes.get('/gyms-answers', GymController.index);

routes.put('/students/:id', StudentController.update);
routes.put('/plans/:id', PlanController.update);
routes.put('/enrolments/:id', EnrolmentController.update);

routes.delete('/plans/:id', PlanController.delete);
routes.delete('/enrolments/:id', EnrolmentController.delete);

export default routes;
