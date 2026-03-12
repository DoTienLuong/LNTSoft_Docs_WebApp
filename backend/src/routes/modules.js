const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

// 🔹 Lấy tất cả modules
router.get('/', moduleController.getAll);

// 🔹 Lấy module theo ID
router.get('/:id', moduleController.getById);

// 🔹 Tạo module mới
router.post('/', moduleController.create);

// 🔹 Cập nhật module
router.put('/:id', moduleController.update);

// 🔹 Xoá module
router.delete('/:id', moduleController.remove);

module.exports = router;
