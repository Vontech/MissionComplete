import express from 'express';
import userController from '../controllers/users.controller';
import taskController from '../controllers/tasks.controller';

const router = express.Router();

// User routes
router.post('/logout', userController.logoutUser);

// Task Routes
router.post('/createTask', taskController.createTask);
router.delete('/removeTask', taskController.removeTask);
router.get('/getTask', taskController.getTask);
router.put('/updateTask', taskController.updateTask);
router.put('/addChildren', taskController.addChildren);
router.put('/removeChildren', taskController.removeChildren);

export default router;
