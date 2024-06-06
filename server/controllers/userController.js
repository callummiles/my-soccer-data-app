import * as UserModel from '../models/UserModel.js';

export const addUser = async (req, res) => {
  try {
    const userData = req.body;
    const response = await UserModel.createUser(userData);
    res.status(201).json(response.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const removeUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const response = await UserModel.deleteUser(userId);
    if (response.status === 204) {
      res.status(204).send('User deleted.');
    } else {
      res.status(404).send('User not found.');
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
