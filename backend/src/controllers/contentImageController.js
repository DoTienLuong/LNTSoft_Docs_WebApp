// const path = require("path");
// const fs = require("fs");
// const contentImageModel = require("../models/contentImageModel");
// const { executeQuery } = require("../config/database");

// // Upload ảnh mới
// const uploadImage = async (req, res) => {
//     try {
//         const { contentId } = req.params;

//         if (!req.file) {
//             return res.status(400).json({ success: false, message: "No file uploaded" });
//         }

//         // Lấy category để biết folder
//         const rows = await executeQuery(
//             `SELECT c.id AS category_id, c.title AS category_title, p.title AS parent_title
//        FROM contents ct
//        JOIN categories c ON ct.category_id = c.id
//        LEFT JOIN categories p ON c.parent_id = p.id
//        WHERE ct.id = ?`,
//             [contentId]
//         );

//         if (rows.length === 0) {
//             return res.status(404).json({ success: false, message: "Content not found" });
//         }

//         const raw = rows[0].parent_title || rows[0].category_title;
//         const folderName = raw
//             .trim()
//             .replace(/\s+/g, "_")
//             .replace(/[^a-zA-Z0-9_-]/g, "");
//         const uploadDir = path.join("uploads", folderName);

//         if (!fs.existsSync(uploadDir)) {
//             fs.mkdirSync(uploadDir, { recursive: true });
//         }

//         // Đường dẫn file cuối cùng (multer đã đặt tên chuẩn)
//         const newFilePath = path.join(uploadDir, req.file.filename);

//         // Chuyển file từ temp (multer lưu tạm) sang đúng folder
//         fs.renameSync(req.file.path, newFilePath);

//         const imageUrl = `/${newFilePath.replace(/\\/g, "/")}`;

//         const id = await contentImageModel.addImage(contentId, imageUrl);

//         res.json({
//             success: true,
//             message: "Image uploaded successfully",
//             data: { id, contentId, imageUrl },
//         });
//     } catch (err) {
//         console.error("Upload image error:", err);
//         res.status(500).json({ success: false, message: "Upload failed" });
//     }
// };

// // Lấy danh sách ảnh theo content
// const getImagesByContent = async (req, res) => {
//     try {
//         const { contentId } = req.params;
//         const images = await contentImageModel.findImagesByContent(contentId);
//         res.json({ success: true, data: images });
//     } catch (err) {
//         console.error("Get images error:", err);
//         res.status(500).json({ success: false, message: "Failed to retrieve images" });
//     }
// };

// // Lấy danh sách ảnh theo category
// const getImagesByCategory = async (req, res) => {
//     try {
//         const { categoryId } = req.params;
//         const images = await contentImageModel.findImagesByCategory(categoryId);
//         res.json({ success: true, data: images });
//     } catch (err) {
//         console.error("Get images by category error:", err);
//         res.status(500).json({ success: false, message: "Failed to retrieve images by category" });
//     }
// };

// // Update ảnh (caption, order, hoặc thay file)
// const updateImage = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const existing = await contentImageModel.findImageById(id);

//         if (!existing) {
//             return res.status(404).json({ success: false, message: "Image not found" });
//         }

//         let updateData = { caption: req.body.caption, order_index: req.body.order_index };

//         if (req.file) {
//             // Lấy category name của content này
//             const query = `
//     SELECT c.id as category_id, c.title as category_title, p.title as parent_title
//     FROM contents ct
//     JOIN categories c ON ct.category_id = c.id
//     LEFT JOIN categories p ON c.parent_id = p.id
//     WHERE ct.id = ?
//   `;
//             const rows = await executeQuery(query, [existing.content_id]);

//             let folderName = "uploads";
//             if (rows.length > 0) {
//                 const raw = rows[0].parent_title || rows[0].category_title;
//                 folderName = `uploads/${raw.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "")}`;
//             }

//             fs.mkdirSync(folderName, { recursive: true });

//             const ext = path.extname(req.file.originalname).toLowerCase();
//             const baseName = (
//                 req.query.filename || path.basename(req.file.originalname, ext)
//             ).replace(/\s+/g, "_");

//             const finalName = req.query.filename
//                 ? `${baseName}${ext}` // nếu có query -> giữ nguyên
//                 : `${baseName}_${Date.now()}${ext}`; // nếu không có query -> thêm timestamp

//             const newPath = path.join(folderName, finalName);

//             // Xóa file cũ (cần chuẩn hóa path vì DB lưu /uploads/...)
//             const oldPath = existing.image_url.startsWith("/")
//                 ? existing.image_url.substring(1) // bỏ dấu "/" đầu
//                 : existing.image_url;

//             if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

//             fs.renameSync(req.file.path, newPath);

//             // ✅ Lưu vào DB luôn dạng /uploads/... để đồng bộ với uploadImage
//             updateData.image_url = `/${newPath.replace(/\\/g, "/")}`;
//         }

//         await contentImageModel.updateImage(id, updateData);

//         res.json({ success: true, message: "Image updated successfully" });
//     } catch (err) {
//         console.error("Update image error:", err);
//         res.status(500).json({
//             success: false,
//             message: "Failed to update image",
//             error: err.message,
//         });
//     }
// };

// // Xóa ảnh
// const deleteImage = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const existing = await contentImageModel.findImageById(id);

//         if (!existing) {
//             return res.status(404).json({ success: false, message: "Image not found" });
//         }

//         // Xóa file vật lý
//         if (fs.existsSync(existing.image_url)) {
//             fs.unlinkSync(existing.image_url);
//         }

//         await contentImageModel.removeImage(id);
//         res.json({ success: true, message: "Image deleted successfully" });
//     } catch (err) {
//         console.error("Delete image error:", err);
//         res.status(500).json({ success: false, message: "Failed to delete image" });
//     }
// };

// module.exports = {
//     uploadImage,
//     getImagesByContent,
//     getImagesByCategory,
//     updateImage,
//     deleteImage,
// };

// v2:
// controllers/contentImageController.js
// const path = require("path");
// const fs = require("fs");
// const contentImageModel = require("../models/contentImageModel");

// // helper: tạo caption từ base name
// const toCaption = (base) =>
//   String(base || "")
//     .replace(/\.[a-z0-9]+$/i, "")  // bỏ extension nếu lỡ còn
//     .replace(/[_-]+/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();

// // helper: chuyển "/uploads/xxx.jpg" -> filesystem path
// const toFsPath = (urlPath) => path.join(process.cwd(), urlPath.replace(/^\//, ""));

// // ✅ POST /api/images/content/:contentId (?filename=optional)
// const uploadImage = async (req, res) => {
//   try {
//     const { contentId } = req.params;
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "No file uploaded" });
//     }

//     // multer đã lưu sẵn ở /uploads/<filename>
//     const imageUrl = `/uploads/${req.file.filename}`;

//     // caption ưu tiên từ query/body, fallback tên gốc
//     const ext = path.extname(req.file.originalname);
//     const baseFromOriginal = path.basename(req.file.originalname, ext);
//     const wantedBase = req.query.filename || req.body?.filename || baseFromOriginal;
//     const caption = toCaption(wantedBase);

//     const id = await contentImageModel.addImage(contentId, imageUrl, caption);

//     res.json({
//       success: true,
//       message: "Image uploaded successfully",
//       data: { id, contentId, imageUrl, caption }
//     });
//   } catch (err) {
//     console.error("Upload image error:", err);
//     res.status(500).json({ success: false, message: "Upload failed" });
//   }
// };

// // ✅ GET /api/images/content/:contentId
// const getImagesByContent = async (req, res) => {
//   try {
//     const { contentId } = req.params;
//     const images = await contentImageModel.findImagesByContent(contentId);
//     res.json({ success: true, data: images });
//   } catch (err) {
//     console.error("Get images error:", err);
//     res.status(500).json({ success: false, message: "Failed to retrieve images" });
//   }
// };

// // (tuỳ chọn) ✅ GET /api/images/category/:categoryId
// const getImagesByCategory = async (req, res) => {
//   try {
//     const { categoryId } = req.params;
//     const images = await contentImageModel.findImagesByCategory(categoryId);
//     res.json({ success: true, data: images });
//   } catch (err) {
//     console.error("Get images by category error:", err);
//     res.status(500).json({ success: false, message: "Failed to retrieve images by category" });
//   }
// };

// // ✅ PUT /api/images/:id (?filename=optional) — re-upload + caption mới
// const updateImage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const existing = await contentImageModel.findImageById(id);
//     if (!existing) {
//       return res.status(404).json({ success: false, message: "Image not found" });
//     }

//     const updateData = {};
//     // cho phép cập nhật caption/order_index qua JSON nếu muốn
//     if (req.body.caption !== undefined) updateData.caption = req.body.caption;
//     if (req.body.order_index !== undefined) updateData.order_index = req.body.order_index;

//     if (req.file) {
//       // xoá file cũ
//       const oldFsPath = toFsPath(existing.image_url);
//       if (fs.existsSync(oldFsPath)) {
//         try { fs.unlinkSync(oldFsPath); } catch (_) {}
//       }

//       // file mới đã nằm ở /uploads theo middleware
//       const newUrl = `/uploads/${req.file.filename}`;

//       // nếu không gửi caption mới, tự sinh lại từ filename query/body/gốc
//       if (updateData.caption === undefined) {
//         const ext = path.extname(req.file.originalname);
//         const baseFromOriginal = path.basename(req.file.originalname, ext);
//         const wantedBase = req.query.filename || req.body?.filename || baseFromOriginal;
//         updateData.caption = toCaption(wantedBase);
//       }

//       updateData.image_url = newUrl;
//     }

//     await contentImageModel.updateImage(id, updateData);
//     res.json({ success: true, message: "Image updated successfully" });
//   } catch (err) {
//     console.error("Update image error:", err);
//     res.status(500).json({ success: false, message: "Failed to update image" });
//   }
// };

// // ✅ DELETE /api/images/:id
// const deleteImage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const existing = await contentImageModel.findImageById(id);
//     if (!existing) {
//       return res.status(404).json({ success: false, message: "Image not found" });
//     }

//     const fsPath = toFsPath(existing.image_url);
//     if (fs.existsSync(fsPath)) {
//       try { fs.unlinkSync(fsPath); } catch (_) {}
//     }

//     await contentImageModel.removeImage(id);
//     res.json({ success: true, message: "Image deleted successfully" });
//   } catch (err) {
//     console.error("Delete image error:", err);
//     res.status(500).json({ success: false, message: "Failed to delete image" });
//   }
// };

// module.exports = {
//   uploadImage,
//   getImagesByContent,
//   getImagesByCategory,
//   updateImage,
//   deleteImage,
// };


// v3:
// controllers/contentImageController.js
const path = require("path");
const fs = require("fs");
const contentImageModel = require("../models/contentImageModel");

const toCaption = (base) =>
  String(base || "")
    .replace(/\.[a-z0-9]+$/i, "")   // bỏ extension nếu còn
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toFsPath = (urlPath) =>
  path.join(process.cwd(), urlPath.replace(/^\//, ""));

// ✅ POST /api/images/content/:contentId
exports.uploadImage = async (req, res) => {
  try {
    const { contentId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // file đã lưu ở /uploads/<randomName>
    const imageUrl = `/uploads/${req.file.filename}`;

    // ✅ caption lấy từ tên gốc của file
    const ext = path.extname(req.file.originalname);
    const baseFromOriginal = path.basename(req.file.originalname, ext);
    const caption = toCaption(baseFromOriginal);

    const id = await contentImageModel.addImage(contentId, imageUrl, caption);

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: { id, contentId, imageUrl, caption }
    });
  } catch (err) {
    console.error("Upload image error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

// ✅ GET /api/images/content/:contentId
exports.getImagesByContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const images = await contentImageModel.findImagesByContent(contentId);
    res.json({ success: true, data: images });
  } catch (err) {
    console.error("Get images error:", err);
    res.status(500).json({ success: false, message: "Failed to retrieve images" });
  }
};

// (tuỳ chọn) ✅ GET /api/images/category/:categoryId
exports.getImagesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const images = await contentImageModel.findImagesByCategory(categoryId);
    res.json({ success: true, data: images });
  } catch (err) {
    console.error("Get images by category error:", err);
    res.status(500).json({ success: false, message: "Failed to retrieve images by category" });
  }
};

// ✅ PUT /api/images/:id — re-upload, caption lại từ tên gốc mới (trừ khi client gửi caption)
exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await contentImageModel.findImageById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    const updateData = {};
    if (req.body.caption !== undefined) updateData.caption = req.body.caption;
    if (req.body.order_index !== undefined) updateData.order_index = req.body.order_index;

    if (req.file) {
      // xoá file cũ
      const oldFs = toFsPath(existing.image_url);
      if (fs.existsSync(oldFs)) {
        try { fs.unlinkSync(oldFs); } catch (_) {}
      }

      // file mới đã có sẵn trong /uploads với tên ngẫu nhiên
      const newUrl = `/uploads/${req.file.filename}`;
      updateData.image_url = newUrl;

      // nếu client không gửi caption mới → lấy từ tên gốc file mới
      if (updateData.caption === undefined) {
        const ext = path.extname(req.file.originalname);
        const baseFromOriginal = path.basename(req.file.originalname, ext);
        updateData.caption = toCaption(baseFromOriginal);
      }
    }

    await contentImageModel.updateImage(id, updateData);
    res.json({ success: true, message: "Image updated successfully" });
  } catch (err) {
    console.error("Update image error:", err);
    res.status(500).json({ success: false, message: "Failed to update image" });
  }
};

// ✅ DELETE /api/images/:id
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await contentImageModel.findImageById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // Xóa file vật lý an toàn
    const fsPath = toFsPath(existing.image_url);
    try {
      if (fs.existsSync(fsPath)) fs.unlinkSync(fsPath);
    } catch (err) {
      // log nhưng không fail hẳn request — để tránh “kẹt” khi file đã bị xóa tay
      console.warn("⚠️ File unlink failed:", err.message);
    }

    // Xóa record DB
    await contentImageModel.removeImage(id);

    res.json({ success: true, message: "Image deleted (DB + file) successfully" });
  } catch (err) {
    console.error("Delete image error:", err);
    res.status(500).json({ success: false, message: "Failed to delete image" });
  }
};
