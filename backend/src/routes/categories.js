// routes/categories.js

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// 🔹 Lấy categories theo module_id (?include_inactive=true để lấy cả inactive)
router.get('/', categoryController.getAll);

// 🔹 Lấy category theo ID
router.get('/:id', categoryController.getById);

// 🔹 Tạo category mới
router.post('/', categoryController.create);

// 🔹 Cập nhật category
router.put('/:id', categoryController.update);

// 🔹 Xoá category
router.delete('/:id', categoryController.remove);

module.exports = router;
