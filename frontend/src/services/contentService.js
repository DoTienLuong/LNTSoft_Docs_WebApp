import {
  getContents,
  getContentsTree,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  searchContents,
} from "../api/contents";

export const contentService = {
  list: async (categoryId, includeUnpublished = false) =>
    (await getContents(categoryId, includeUnpublished)).data.data,
  tree: async (categoryId, includeUnpublished = false) =>
    (await getContentsTree(categoryId, includeUnpublished)).data.data,
  detail: async (id) => (await getContentById(id)).data,
  create: async (data) => (await createContent(data)).data,
  update: async (id, data) => (await updateContent(id, data)).data,
  remove: async (id) => (await deleteContent(id)).data,
  search: async (q, moduleId) => (await searchContents(q, moduleId)).data,
};
