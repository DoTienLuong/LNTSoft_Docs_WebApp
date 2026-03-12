//src/components/category/CategoryContainer.jsx

import React, { useEffect, useState, useRef } from "react";
import { categoryService } from "../../services/categoryService";
import { buildCategoryTree, filterCategories } from "./categoryConfig/categoryHelper";
import CategorySearchBox from "./categoryConfig/CategorySearchBox";
import CategoryList from "./CategoryList";
// CRUD form removed; category list is read-only
import { useTheme } from "../../contexts/ThemeContext";
import { getCategoryStyles } from "./categoryConfig/categoryStyle";

export default function CategoryContainer({ moduleId, onSelectCategory, selectedCategoryId, nameModuleSelected, iconModuleSelected, userRole, titleCategorySelected, collapsed = false }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState("");
  console.log(nameModuleSelected);

  // Edit/Add states removed — read-only list

  const [openParents, setOpenParents] = useState({}); // track category mở
  const initialOpenSet = useRef(false);

  // ✅ Lấy danh sách category theo module
  useEffect(() => {
    if (moduleId) {
      categoryService.list(moduleId).then(setCategories);
    }
  }, [moduleId]);

  // Nếu parent (App / Header) truyền selectedCategoryId, đồng bộ local selection và mở parents
  useEffect(() => {
    if (!selectedCategoryId) return;
    const idNum = Number(selectedCategoryId);
    setSelectedCategory(idNum);

    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.parent_id ?? c.parentId ?? null;
    });
    const newOpen = {};
    let cur = map[idNum] ?? null;
    while (cur) {
      newOpen[cur] = true;
      cur = map[cur] ?? null;
    }
    if (Object.keys(newOpen).length > 0) setOpenParents((prev) => ({ ...prev, ...newOpen }));
  }, [selectedCategoryId, categories]);

  // ✅ Cập nhật tree mỗi lần có data mới
  const tree = buildCategoryTree(categories);
  const filteredTree = filterCategories(search, tree);

  const refresh = async () => {
    if (moduleId) setCategories(await categoryService.list(moduleId));
  };

  // Force read-only for all roles
  const isReadOnly = true;

  // Removed move up/down feature for categories

  const toggleParent = (id) => {
    setOpenParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  useEffect(() => {
    if (search) {
      const newOpen = {};
      const openAll = (nodes) => {
        nodes.forEach((n) => {
          if (n.children?.length > 0) {
            newOpen[n.id] = true;
            openAll(n.children);
          }
        });
      };
      openAll(filteredTree);
      setOpenParents((prev) => ({ ...prev, ...newOpen }));
    }
  }, [search, filteredTree]);

  // Open all parent nodes by default once when the tree first loads so the
  // UI shows full content (as requested). We guard with a ref so user toggles
  // later are preserved and we don't re-open on every update.
  useEffect(() => {
    if (initialOpenSet.current) return;
    const newOpen = {};
    const openAll = (nodes) => {
      nodes.forEach((n) => {
        if (n.children?.length > 0) {
          newOpen[n.id] = true;
          openAll(n.children);
        }
      });
    };
    openAll(tree);
    setOpenParents((prev) => ({ ...prev, ...newOpen }));
    initialOpenSet.current = true;
  }, [tree]);

  // theme styles
  const { effective } = useTheme();
  const styles = getCategoryStyles(effective);

  // Ẩn hoàn toàn khi collapsed
  if (collapsed) {
    return null;
  }

  return (
    <aside className={styles.listStyle}>
      {/* --- Header + Search cố định --- */}
      <div className={`sticky top-0 bg-transparent z-10 pb-1 ${styles.headerBorderClass}`}>
        <div className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition ${styles.titleTextClass}`}>
          <i className={`${iconModuleSelected} text-sm ${styles.titleTextClass}`}></i>
          <h2 className={`text-sm font-semibold ${styles.titleTextClass}`}>{nameModuleSelected}</h2>
        </div>
        <CategorySearchBox value={search} onChange={setSearch} dark={effective === "dark"} />
      </div>

      {/* --- Danh sách category --- */}
      {/* flex-1 + min-h-0 allows this area to shrink and produce a proper scrollbar inside the
        bounded aside (which has max-h set in styles). */}
      <div className="flex-1 overflow-y-auto mt-2 pr-1 min-h-0">
        <CategoryList
          tree={filteredTree}
          selectedCategory={selectedCategory}
          openParents={openParents}
          toggleParent={toggleParent}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            const found = categories.find((c) => Number(c.id) === Number(id));
            onSelectCategory?.(id);
            titleCategorySelected?.(found?.title || "");
          }}
          onEditStart={undefined}
          onEditChange={undefined}
          onEditSave={undefined}
          onEditCancel={undefined}
          editState={{ editingId: null, editTitle: "", editOrder: 0, editActive: true }}
          onDelete={undefined}
          onMove={undefined}
          isReadOnly={isReadOnly}
          styles={styles}
        />
      </div>

    </aside>
  );
}
