// src/controllers/contentController.js
const path = require('path');
const fs = require('fs');
const { executeQuery } = require('../config/database');

const toFsPath = (urlPath) => path.join(process.cwd(), urlPath.replace(/^\//, ''));

async function cleanupContentImages(contentId) {
  // lấy toàn bộ image_url của content trước khi xóa
  const images = await executeQuery(
    'SELECT image_url FROM content_images WHERE content_id = ?',
    [contentId]
  );

  for (const img of images) {
    try {
      const p = toFsPath(img.image_url);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (e) {
      // không chặn quy trình xóa nếu file đã bị xóa tay
      console.warn('⚠️ Unlink failed:', img.image_url, e.message);
    }
  }
}
module.exports = {
  cleanupContentImages
};