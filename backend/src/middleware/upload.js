// // middleware/upload.js
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const { executeQuery } = require("../config/database");

// const storage = multer.diskStorage({
//   destination: async (req, file, cb) => {
//     try {
//       const { categoryId } = req.params;
//       let folderName = "uploads";

//       if (categoryId) {
//         // 🔹 Lấy category + parent từ DB
//         const query = `
//           SELECT c.title as category_title, p.title as parent_title
//           FROM categories c
//           LEFT JOIN categories p ON c.parent_id = p.id
//           WHERE c.id = ?
//         `;
//         const rows = await executeQuery(query, [categoryId]);

//         if (rows.length > 0) {
//           const raw = rows[0].parent_title || rows[0].category_title;

//           // 🔹 Làm sạch tên folder
//           folderName = `uploads/${raw
//             .replace(/\s+/g, "_")        // khoảng trắng -> "_"
//             .replace(/[^a-zA-Z0-9_-]/g, "") // bỏ ký tự đặc biệt
//           }`;
//         }
//       }

//       // 🔹 Tạo thư mục nếu chưa có
//       fs.mkdirSync(folderName, { recursive: true });
//       cb(null, folderName);
//     } catch (err) {
//       cb(err, "uploads");
//     }
//   },

//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     let baseName = req.query.filename || req.body?.filename;

//     if (!baseName) {
//       // 🔹 Nếu không truyền custom name, lấy tên gốc (không dấu cách)
//       baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_");
//     } else {
//       // 🔹 Nếu có custom name thì làm sạch
//       baseName = baseName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
//     }

//     // 🔹 Luôn thêm timestamp để tránh ghi đè
//     cb(null, `${baseName}_${Date.now()}${ext}`);
//   }
// });

// // 🔹 Chỉ cho phép các loại file ảnh
// const fileFilter = (req, file, cb) => {
//   const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
//   if (allowed.includes(file.mimetype)) cb(null, true);
//   else cb(new Error("Only jpg, png, gif, webp allowed"), false);
// };

// const upload = multer({ storage, fileFilter });
// module.exports = upload;

// v2:
// middleware/upload.js
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const ensureUploads = () => {
//   const dir = "uploads";
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
//   return dir;
// };

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     try {
//       cb(null, ensureUploads());             // ✅ luôn là "uploads"
//     } catch (err) {
//       cb(err, "uploads");
//     }
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();

//     // ✅ ưu tiên tên custom qua query (?filename=...), sau đó body, cuối cùng tên gốc
//     let base = req.query.filename || req.body?.filename || path.basename(file.originalname, ext);
//     base = String(base).trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");

//     // ✅ luôn thêm timestamp để tránh trùng
//     cb(null, `${base}_${Date.now()}${ext}`);
//   }
// });

// const fileFilter = (_req, file, cb) => {
//   const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
//   cb(null, allowed.includes(file.mimetype));
// };

// module.exports = multer({ storage, fileFilter });

// v3: 
// middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const ensureUploads = () => {
  const dir = "uploads";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      cb(null, ensureUploads()); // luôn /uploads
    } catch (err) {
      cb(err, "uploads");
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // ✅ tên ngẫu nhiên, không dùng query/body để tránh đoán đường dẫn
    const rand = crypto.randomBytes(6).toString("hex");
    const finalName = `${Date.now()}_${rand}${ext}`;
    cb(null, finalName);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  cb(null, allowed.includes(file.mimetype));
};

module.exports = multer({ storage, fileFilter });
