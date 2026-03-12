// Không dùng IMAGE_BASE_URL cho API! Dùng VITE_API_URL để call backend.
const API_BASE = import.meta.env.VITE_API_URL; // ví dụ: http://localhost:4000

async function docxToHtml(file, extra = {}) {
  const form = new FormData();
  form.append("file", file);
  // Nếu backend của bạn đọc "contentId" thì thêm cũng OK (không bắt buộc)
  if (extra.contentId) form.append("contentId", extra.contentId);

  const res = await fetch(`${API_BASE}/api/convert`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Convert failed: ${res.status} ${txt}`);
  }

  const data = await res.json().catch(() => ({}));
  // Backend của bạn trả { html } hoặc { data: { html } }
  const html = data?.html ?? data?.data?.html ?? "";
  return { html, raw: data };
}

export const convertService = { docxToHtml };
