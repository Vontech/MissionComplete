import express from 'express';
import userController from '../controllers/users.controller'

const router = express.Router();

router.post('/users', userController.createUser);

export default router;