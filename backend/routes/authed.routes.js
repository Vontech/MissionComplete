import express from 'express';
import userController from '../controllers/users.controller';
import taskController from '../controllers/tasks.controller';

const router = express.Router();

// User routes
router.post('/logout', userController.logoutUser);

// Task Routes
router.post('/createTask', taskController.createTask);

export default router;