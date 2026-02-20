const express = require('express');
const router = express.Router();
const { login, createUser, deleteUser, getUsers, updateUser } = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');

router.post('/login', login);
router.post('/', authenticateToken(['admin']), createUser);
router.delete('/:id', authenticateToken(['admin']), deleteUser);
router.put('/:id', authenticateToken(['admin']), updateUser);
router.get('/', authenticateToken(['admin']), getUsers);

module.exports = router;
