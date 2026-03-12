// src/components/category/shared/categoryHelper.js
// ✅ Xây dựng cây category nhiều cấp (level không giới hạn)
export function buildCategoryTree(categories) {
  // Tạo map id → category có children
  const map = {};
  categories.forEach((c) => {
    map[c.id] = { ...c, children: [] };
  });

  const roots = [];

  categories.forEach((c) => {
    if (c.parent_id) {
      const parent = map[c.parent_id];
      if (parent) parent.children.push(map[c.id]);
    } else {
      roots.push(map[c.id]); // Không có parent → top-level
    }
  });

  return roots; // ✅ Trả về mảng gốc, mỗi phần tử có thể có children lồng nhau
}

// ✅ Lọc tree theo search text (đệ quy)
export function filterCategories(search, tree) {
  if (!search) return tree;

  const lower = search.toLowerCase();

  const filterNode = (node) => {
    const match = node.title.toLowerCase().includes(lower);
    const filteredChildren = node.children
      ?.map(filterNode)
      .filter((child) => child !== null);

    if (match || (filteredChildren && filteredChildren.length > 0)) {
      return { ...node, children: filteredChildren };
    }
    return null;
  };

  return tree.map(filterNode).filter((n) => n !== null);
}
