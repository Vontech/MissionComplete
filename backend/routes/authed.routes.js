import express from 'express';
import userController from '../controllers/users.controller';
import taskController from '../controllers/tasks.controller';

const router = express.Router();

// User routes
router.post('/logout', userController.logoutUser);

// Task Routes
router.post('/task', taskController.createTask);
router.get('/allTasks', taskController.getTasks);
router.delete('/task/:taskId', taskController.removeTask);
router.get('/task', taskController.getTask);
router.patch('/task', taskController.updateTask);
router.post('/removeChildren', taskController.removeChildren);

export default router;
