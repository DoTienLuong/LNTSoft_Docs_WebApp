// src/config/quillConfigWordLike.js
import Quill from "quill";

/**
 * DÙNG STYLE-BASED ATTRIBUTORS cho Font & Size
 * -> giữ format ổn định khi Enter, dropdown hiển thị đúng tên,
 * -> tương thích tốt lúc load lại nội dung để edit.
 */

// Font: dùng style "font-family"
const Font = Quill.import("attributors/style/font");
Font.whitelist = [
  "Arial",
  "Times New Roman",
  "Roboto",
  "Montserrat",
  "Lora",
  "Poppins",
  "Open Sans",
  "Georgia",
  "Verdana",
  "Courier New",
];
Quill.register(Font, true);

// Size: dùng style "font-size"
const Size = Quill.import("attributors/style/size");
Size.whitelist = ["10px", "12px", "14px", "16px", "18px", "24px", "32px"];
Quill.register(Size, true);

// MODULES
export const quillModules = {
  toolbar: [
    [
      { header: [1, 2, 3, 4, 5, 6, false] },
      { font: Font.whitelist },   // dùng đúng tên như whitelist
      { size: Size.whitelist },   // dùng px
    ],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
  clipboard: { matchVisual: false },
  history: { delay: 500, maxStack: 500, userOnly: true },
};

// FORMATS
export const quillFormats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "align",
  "list",
  "indent",
  "blockquote",
  "code-block",
  "link",
];
