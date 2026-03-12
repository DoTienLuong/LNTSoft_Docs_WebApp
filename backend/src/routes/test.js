const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');

// Test API: trả về tất cả modules
router.get('/modules', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM modules');
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
