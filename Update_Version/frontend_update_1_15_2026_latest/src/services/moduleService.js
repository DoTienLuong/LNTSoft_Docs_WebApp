import {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} from "../api/modules";

export const moduleService = {
  list: async () => {
    const res = await getModules();
    return res.data.data;
  },
  detail: async (id) => {
    const res = await getModuleById(id);
    return res.data;
  },
  create: async (data) => {
    const res = await createModule(data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await updateModule(id, data);
    return res.data;
  },
  remove: async (id) => {
    const res = await deleteModule(id);
    return res.data;
  },
};
