const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route CRUD
router.get('/', userController.getAnggota);
router.post('/', userController.createAnggota);
router.put('/:id', userController.updateAnggota);
router.delete('/:id', userController.deleteAnggota);

module.exports = router;
