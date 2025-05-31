import { readFile } from "fs/promises";

export default defineEventHandler(async (event) => {
  try {
    const data = await readFile("server/clients_with_coords.json", "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
});
