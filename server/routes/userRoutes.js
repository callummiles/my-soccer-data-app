import express from 'express';
import * as userController from '../controllers/UserController.js';

const router = express.Router();

router.post('/users', userController.addUser);
router.delete('/users/:id', userController.removeUser);

export default router;
