-- Migration: Add parent_id to contents to support hierarchical (tree) structure
-- Use with MySQL-compatible database.

-- Option A: Add parent_id with foreign key (CASCADE delete)
ALTER TABLE contents
  ADD COLUMN parent_id INT NULL AFTER category_id,
  ADD INDEX idx_contents_parent (parent_id),
  ADD CONSTRAINT fk_contents_parent
    FOREIGN KEY (parent_id) REFERENCES contents(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

-- Option B (if provider disallows FK, e.g., PlanetScale): only add column + index
-- ALTER TABLE contents
--   ADD COLUMN parent_id INT NULL AFTER category_id,
--   ADD INDEX idx_contents_parent (parent_id);

-- Notes:
-- 1) If your provider (PlanetScale) rejects FOREIGN KEY creation, use Option B.
-- 2) After running migration, existing rows will have parent_id = NULL (root nodes).
-- 3) If you want different delete behavior, adjust ON DELETE clause or handle deletes in application logic.

USE guidebook_fullstack;

-- Dọn temp table nếu còn sót từ lần chạy trước
DROP TEMPORARY TABLE IF EXISTS tmp_category_tree;
DROP TEMPORARY TABLE IF EXISTS tmp_category_to_content;
DROP TEMPORARY TABLE IF EXISTS tmp_category_to_content_copy;
DROP TEMPORARY TABLE IF EXISTS tmp_content_parent_map;

-- 1. Tính cây category: root_id, depth (0 = root, >0 = category con)
CREATE TEMPORARY TABLE tmp_category_tree AS
WITH RECURSIVE cat_tree AS (
    SELECT 
        id          AS category_id,
        parent_id,
        id          AS root_id,
        0           AS depth
    FROM categories
    WHERE parent_id IS NULL              -- category root

    UNION ALL

    SELECT 
        c.id        AS category_id,
        c.parent_id,
        ct.root_id  AS root_id,
        ct.depth + 1 AS depth
    FROM categories c
    JOIN cat_tree ct ON c.parent_id = ct.category_id
)
SELECT * FROM cat_tree;

-- 2. Tạo "content root" từ các category con (depth > 0)
--    category_id của content root = category root (root_id)
INSERT INTO contents (
    category_id,
    parent_id,
    title,
    html_content,
    plain_content,
    is_published,
    view_count,
    order_index,
    create_update_at
)
SELECT 
    t.root_id              AS category_id,   -- luôn trỏ về category root
    NULL                   AS parent_id,     -- content root level 1 (tạm)
    c.title                AS title,
    c.description          AS html_content,
    c.description          AS plain_content,
    1                      AS is_published,
    0                      AS view_count,
    c.order_index          AS order_index,
    c.create_update_at     AS create_update_at
FROM categories c
JOIN tmp_category_tree t 
  ON t.category_id = c.id
WHERE t.depth > 0;                          -- chỉ category con

-- 3. Map category con -> content root vừa tạo
CREATE TEMPORARY TABLE tmp_category_to_content AS
SELECT 
    c.id          AS category_id,
    t.root_id,
    t.depth,
    ct.id         AS content_root_id
FROM categories c
JOIN tmp_category_tree t 
  ON t.category_id = c.id
JOIN contents ct
  ON ct.category_id = t.root_id
 AND ct.parent_id IS NULL        -- content root
 AND ct.title = c.title          -- trùng title với category
WHERE t.depth > 0;

-- 4. Tạo bản copy để tránh "reopen table" khi join 2 lần
CREATE TEMPORARY TABLE tmp_category_to_content_copy AS
SELECT * FROM tmp_category_to_content;

-- 5. Tạo map child_content_root -> parent_content_root 
--    (dùng tmp_category_to_content + bản copy)
CREATE TEMPORARY TABLE tmp_content_parent_map AS
SELECT
    child.content_root_id  AS child_content_id,
    parent.content_root_id AS parent_content_id
FROM tmp_category_to_content child
JOIN categories c_child 
  ON c_child.id = child.category_id
JOIN tmp_category_to_content_copy parent
  ON c_child.parent_id = parent.category_id;

-- 6. Gán parent_id cho các content root cấp 2,3… theo cây category cũ
UPDATE contents c
JOIN tmp_content_parent_map m
  ON c.id = m.child_content_id
SET c.parent_id = m.parent_content_id;

-- Sau câu lệnh này:
-- - Content root mà category cha là category root → vẫn parent_id = NULL (level 1)
-- - Content root mà category cha là category con → parent_id = content root cha (level 2, 3…)

-- 7. Di chuyển các content cũ thuộc category con:
--    - category_id chuyển về root_id
--    - parent_id = content_root_id tương ứng (content level 2,3…)
UPDATE contents c
JOIN tmp_category_tree t 
  ON c.category_id = t.category_id
JOIN tmp_category_to_content m_cat 
  ON m_cat.category_id = c.category_id
SET 
    c.parent_id   = m_cat.content_root_id,   -- con của content root
    c.category_id = t.root_id               -- luôn gắn vào category root
WHERE 
    t.depth > 0                              -- chỉ category con
    AND c.id <> m_cat.content_root_id;       -- không sửa chính content root mới tạo

-- 8. Xoá toàn bộ category con, giữ lại category root
DELETE FROM categories
WHERE id IN (
    SELECT category_id 
    FROM tmp_category_tree 
    WHERE depth > 0
);

-- 9. Dọn temp table
DROP TEMPORARY TABLE tmp_category_tree;
DROP TEMPORARY TABLE tmp_category_to_content;
DROP TEMPORARY TABLE tmp_category_to_content_copy;
DROP TEMPORARY TABLE tmp_content_parent_map;
