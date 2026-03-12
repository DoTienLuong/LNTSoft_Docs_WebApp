const { executeQuery } = require('../config/database');

// Thêm ảnh mới
const addImage = async (contentId, imageUrl, caption = null, order_index = 0, originalName = null) => {
  const result = await executeQuery(
    `INSERT INTO content_images (content_id, image_url, caption, order_index)
     VALUES (?, ?, ?, ?)`,
    [contentId, imageUrl, caption, order_index]
  );
  return result.insertId;
};

// Lấy ảnh theo content
const findImagesByContent = async (contentId) => {
  return await executeQuery(
    'SELECT * FROM content_images WHERE content_id = ? ORDER BY order_index ASC',
    [contentId]
  );
};

// Lấy ảnh theo category
const findImagesByCategory = async (categoryId) => {
  const query = `
    SELECT i.*
    FROM content_images i
    JOIN contents c ON i.content_id = c.id
    WHERE c.category_id = ?
    ORDER BY i.order_index ASC
  `;
  return await executeQuery(query, [categoryId]);
};

// Lấy 1 ảnh theo id
const findImageById = async (id) => {
  const rows = await executeQuery('SELECT * FROM content_images WHERE id = ?', [id]);
  return rows[0];
};

// Cập nhật ảnh (chỉ caption, order_index, hoặc đổi file)
const updateImage = async (id, data) => {
  const fields = [];
  const params = [];

  ['image_url', 'caption', 'order_index'].forEach((key) => {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  });

  if (!fields.length) return { affectedRows: 0 };

  params.push(id);
  return await executeQuery(`UPDATE content_images SET ${fields.join(', ')} WHERE id = ?`, params);
};

// Xóa ảnh
const removeImage = async (id) => {
  return await executeQuery('DELETE FROM content_images WHERE id = ?', [id]);
};

module.exports = {
  addImage,
  findImagesByContent,
  findImagesByCategory,
  findImageById,
  updateImage,
  removeImage
};
