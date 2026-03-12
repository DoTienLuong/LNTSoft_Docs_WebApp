import api from "./client";

// GET all by category
export const getContents = (categoryId, includeUnpublished = false) => {
  const includeParam = includeUnpublished ? "&include=all" : "";
  return api.get(`/contents?category_id=${categoryId}${includeParam}`);
};
// Lấy tất cả content theo category
export const getContentsByCategory = (categoryId, includeUnpublished = false) =>
  api.get(`/contents?category_id=${categoryId}&includeUnpublished=${includeUnpublished}`);

// GET tree structure (hierarchical) for a category
export const getContentsTree = (categoryId, includeUnpublished = false) =>
  api.get(`/contents/tree/${categoryId}${includeUnpublished ? '?include=all' : ''}`);

// GET by ID
export const getContentById = (id) => api.get(`/contents/${id}`);

// CREATE
export const createContent = (data) => api.post("/contents", data);

// UPDATE
export const updateContent = (id, data) => api.put(`/contents/${id}`, data);

// DELETE
export const deleteContent = (id) => api.delete(`/contents/${id}`);

// SEARCH
export const searchContents = (q, moduleId) =>
  api.get(`/contents/search?q=${encodeURIComponent(q)}${moduleId ? `&module_id=${moduleId}` : ""}`);
