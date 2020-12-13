import express from 'express';
import userController from '../controllers/users.controller';
import taskController from '../controllers/tasks.controller';

const router = express.Router();

// User routes
router.post('/logout', userController.logoutUser);
router.get('/preferences', userController.getUserPreferences);
router.post('/preferences', userController.saveUserPreferences, userController.getUserPreferences);
router.get('/userInfo', userController.getUserInformation);
router.post('/uploadProfilePicture', userController.prepareProfilePicture, userController.uploadProfilePicture);
router.get('/getProfilePicture/:username', userController.getProfilePicture);

// Task Routes
router.post('/task', taskController.createTask);
router.get('/allTasks', taskController.getTasks);
router.delete('/task/:taskId', taskController.removeTask);
router.get('/task', taskController.getTask);
router.post('/updateTask', taskController.updateTask);
router.post('/removeChildren', taskController.removeChildren);

export default router;
