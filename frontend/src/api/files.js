import { api } from "./client";

export const getFiles = async () => {
  const res = await api.get("/api/files");
  return res.data.files || [];
};
