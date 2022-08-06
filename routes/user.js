const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, loginUser, deleteUser, getUser } = require('../controllers/user');
const verifyToken = require('../middleware/Auth');

router.get('/',  getAllUsers);
router.post('/create', createUser);
router.get('/user', getUser);
router.post('/login', loginUser);
router.delete('/delete', verifyToken, deleteUser);

module.exports = router;
