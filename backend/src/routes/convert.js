// src/routes/convert.js
const express = require("express");
const multer = require("multer");
const { convertDocx } = require("../controllers/convertController");

const router = express.Router();

/**
 * Dùng memoryStorage để có buffer ngay trong RAM (không cần ghi file tạm)
 * Giới hạn kích thước ví dụ 15MB
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const ok =
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      /\.docx$/i.test(file.originalname);
    if (!ok) return cb(new Error("Only .docx allowed"));
    cb(null, true);
  },
});

// POST /api/convert  (form-data: file=<.docx>, contentId?=...)
router.post("/", upload.single("file"), convertDocx);

module.exports = router;
