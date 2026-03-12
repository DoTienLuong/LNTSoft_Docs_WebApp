const { executeQuery } = require('../config/database');
const path = require('path');

const mediaController = {
  // POST /api/media/upload
  uploadFile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { content_id } = req.body; // có thể null
      const file = req.file;

      // Lưu metadata vào DB
      const query = `
        INSERT INTO media_files (content_id, filename, original_name, file_path, file_size, file_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const params = [
        content_id || null,
        file.filename,
        file.originalname,
        path.join('uploads', file.filename),
        file.size,
        file.mimetype
      ];

      const result = await executeQuery(query, params);

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          id: result.insertId,
          filename: file.filename,
          original_name: file.originalname,
          mime_type: file.mimetype,
          file_size: file.size,
          file_path: `/uploads/${file.filename}`
        }
      });
    } catch (err) {
      console.error('Upload file error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file'
      });
    }
  }
};

module.exports = mediaController;
