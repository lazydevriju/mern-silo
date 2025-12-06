import { api } from "./client";

export const createShareLink = async ({ filename, expiresInMinutes, maxDownloads }) => {
  const res = await api.post("/api/share", {
    filename,
    expiresInMinutes,
    maxDownloads,
  });
  return res.data; // { url, expiresAt, maxDownloads }
};
