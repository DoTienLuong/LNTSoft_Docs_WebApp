// src/controllers/convertController.js (CommonJS)
const mammoth = require("mammoth");

// Nếu bạn muốn xóa mọi <img> trong HTML (vì ảnh lưu riêng)
function stripImages(html) {
  return html.replace(/<img[^>]*>/gi, "");
}

/**
 * POST /api/convert
 * Form-Data: file=<.docx>, contentId?=<id bài viết của bạn>
 * Trả về: { ok, contentId, html, warnings }
 */
exports.convertDocx = async (req, res) => {
  try {
    // Multer để file ở req.file
    const f = req.file;
    const contentId = req.body?.contentId || "demo-1";

    if (!f) return res.status(400).json({ ok: false, error: "No file uploaded" });

    // Kiểm tra đúng đuôi/mime .docx (multer đã lọc 1 lớp dưới route)
    const isDocx =
      /\.docx$/i.test(f.originalname) ||
      f.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (!isDocx) {
      return res.status(400).json({ ok: false, error: "Only .docx allowed" });
    }

    // Convert -> HTML
    const { value: rawHtml, messages } = await mammoth.convertToHtml(
      { buffer: f.buffer },
      {
        // map style Word -> HTML (bạn có thể mở rộng theo nhu cầu)
        styleMap: [
          "u => u",
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          // Ví dụ: đoạn có style 'Quote' -> <blockquote>
          "p[style-name='Quote'] => blockquote:fresh"
        ],
        // Không cấu hình convertImage vì ảnh bạn lưu riêng
      }
    );

    const html = stripImages(rawHtml); // bỏ ảnh inline (nếu có)

    // Nếu muốn LƯU NGAY vào DB hiện có, bạn có thể mở comment dưới
    // const { updateContent } = require("../models/contentModel"); // ví dụ
    // await updateContent(contentId, { htmlBody: html });

    return res.json({
      ok: true,
      contentId,
      html,
      warnings: (messages || []).filter((m) => m.type !== "info"),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Convert failed" });
  }
};
