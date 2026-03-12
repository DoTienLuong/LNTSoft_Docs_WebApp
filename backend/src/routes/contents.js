const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// 🔹 Lấy contents theo category_id (?include=all để lấy cả unpublished)
router.get('/', contentController.getContentsByCategory);

// 🔹 Tìm kiếm content
// đặt route tìm kiếm trước route theo id để tránh bị 
// router.get('/:id') bắt nhầm (ví dụ '/search' sẽ bị coi là id = 'search')
router.get('/search', contentController.searchContents);

// 🔹 Lấy cây content theo category
router.get('/tree/:categoryId', contentController.getContentsTreeByCategory);

// 🔹 Lấy content theo ID
router.get('/:id', contentController.getContentById);

// 🔹 Tạo content mới
router.post('/', contentController.createContent);

// 🔹 Cập nhật content
router.put('/:id', contentController.updateContent);

// 🔹 Xoá content
router.delete('/:id', contentController.deleteContent);

module.exports = router;
