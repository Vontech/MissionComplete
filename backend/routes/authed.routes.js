import express from 'express';
import userController from '../controllers/users.controller';
import taskController from '../controllers/tasks.controller';

const router = express.Router();

// User routes
router.post('/logout', userController.logoutUser);
router.get('/preferences', userController.getUserPreferences);
router.post('/preferences', userController.saveUserPreferences, userController.getUserPreferences);

// Task Routes
router.post('/task', taskController.createTask);
router.get('/allTasks', taskController.getTasks);
router.delete('/task/:taskId', taskController.removeTask);
router.get('/task', taskController.getTask);
router.post('/updateTask', taskController.updateTask);
router.post('/removeChildren', taskController.removeChildren);

export default router;
