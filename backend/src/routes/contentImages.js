const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const controller = require('../controllers/contentImageController');

// Upload ảnh mới
router.post('/content/:contentId', upload.single('file'), controller.uploadImage);

// Lấy ảnh theo content
router.get('/content/:contentId', controller.getImagesByContent);

// Lấy ảnh theo category
router.get('/category/:categoryId', controller.getImagesByCategory);

// Update ảnh (có thể gửi file mới + caption)
router.put('/:id', upload.single('file'), controller.updateImage);

// Xóa ảnh
router.delete('/:id', controller.deleteImage);

module.exports = router;
